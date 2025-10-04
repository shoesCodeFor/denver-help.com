/**
 * Job Parser - Core parsing functionality
 *
 * This module contains the core functions for parsing job site HTML
 * and extracting structured job listing data with support for multiple providers.
 */
const cheerio = require('cheerio');

/**
 * Configuration for different job listing providers
 * Each provider has its own selectors and parsing rules
 */
const PROVIDERS = {
  indeed: {
    name: 'Indeed',
    domain: 'indeed.com',
    baseUrl: 'https://www.indeed.com',
    jobCardSelectors: [
      '.job_seen_beacon',
      '.jobsearch-ResultsList > div',
      '[data-testid="jobcardhovertrigger"]',
      '.jobCard',
      '.mosaic-provider-jobcards .mosaic-zone',
      '.cardOutline'
    ],
    titleSelectors: ['h2.jobTitle', '.jcs-JobTitle', '[data-testid="jobTitle"]', 'h2.title', '.job-title', 'span[title]'],
    companySelectors: ['.companyName', '[data-testid="company-name"]', '.company', '.companyInfo span:first-child'],
    locationSelectors: ['.companyLocation', '[data-testid="text-location"]', '.location', '.companyInfo .companyLocation'],
    snippetSelectors: ['.job-snippet', '.summary', '.job-snippet-container', '.underShelfFooter div:not([class])'],
    salarySelectors: ['.salary-snippet', '.salaryText', '[data-testid="salary-snippet"]', '.attribute_snippet', 'div[class^="salary"]'],
    dateSelectors: ['.date', '.jobAge', '[data-testid="jobAge"]', '.result-footer .date', 'span.date'],
    createUrl: (path) => path.startsWith('/') ? `https://www.indeed.com${path}` : path,
    extractId: (url) => {
      const match = url.match(/jk=([a-f0-9]+)/);
      return match ? match[1] : null;
    }
  },
  // Add more providers here as needed
  linkedin: {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    baseUrl: 'https://www.linkedin.com',
    jobCardSelectors: [
      '.job-search-card',
      '.jobs-search-results__list-item'
    ],
    titleSelectors: ['.job-search-card__title', '.base-search-card__title'],
    companySelectors: ['.job-search-card__subtitle', '.base-search-card__subtitle'],
    locationSelectors: ['.job-search-card__location', '.job-search-card__location-line'],
    snippetSelectors: ['.job-search-card__snippet'],
    salarySelectors: ['.job-search-card__salary-info'],
    dateSelectors: ['.job-search-card__listdate', 'time'],
    createUrl: (path) => path.startsWith('/') ? `https://www.linkedin.com${path}` : path,
    extractId: (url) => {
      const match = url.match(/jobId=(\d+)/);
      return match ? match[1] : null;
    }
  }
  // Can add more providers like ziprecruiter, glassdoor, etc.
};

/**
 * Detect the job provider from HTML content or URL
 * @param {string} html - HTML content
 * @param {string} url - Optional URL to help determine provider
 * @returns {Object} - Provider configuration object
 */
function detectProvider(html, url = '') {
  // Try to detect from URL first
  if (url) {
    for (const [id, provider] of Object.entries(PROVIDERS)) {
      if (url.includes(provider.domain)) {
        return provider;
      }
    }
  }
  
  // Try to detect from HTML content
  const $ = cheerio.load(html);
  const title = $('title').text().toLowerCase();
  
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    if (title.includes(provider.domain) || html.includes(provider.domain)) {
      return provider;
    }
  }
  
  // Default to Indeed if we can't detect
  return PROVIDERS.indeed;
}

/**
 * Parse job listings HTML using the appropriate provider
 * @param {string} html - The HTML content to parse
 * @param {Object} options - Optional configuration options
 * @param {boolean} options.verbose - Whether to log verbose output
 * @param {string} options.provider - Force using a specific provider
 * @param {string} options.url - The source URL to help detect provider
 * @returns {Array} - Array of job listing objects
 */
function parseJobsHTML(html, options = {}) {
  const $ = cheerio.load(html);
  const jobListings = [];
  const verbose = options.verbose || false;
  
  // Determine which provider to use
  const provider = options.provider ?
    PROVIDERS[options.provider] :
    detectProvider(html, options.url);
  
  if (verbose) {
    console.log(`Using provider: ${provider.name}`);
    console.log('Page title:', $('title').text());
  }
  
  let usedSelector = '';
  let foundElements = 0;
  
  // Try each selector until we find job listings
  for (const selector of provider.jobCardSelectors) {
    const elements = $(selector);
    foundElements = elements.length;
    
    if (foundElements > 0) {
      if (verbose) {
        console.log(`Found ${foundElements} elements with selector: ${selector}`);
      }
      usedSelector = selector;
      
      // Extract job data from each element
      elements.each((i, element) => {
        const job = extractJobData($, element, provider);
        
        // Add source information
        job.source = provider.name;
        
        // Add job to listings if it has at least a title
        if (job.title) {
          jobListings.push(job);
        }
      });
      
      // If we found job listings, break out of the loop
      if (jobListings.length > 0) {
        break;
      }
    }
  }
  
  // Log debug information if no jobs were found
  if (jobListings.length === 0 && verbose) {
    console.log(`Tried ${provider.jobCardSelectors.length} different selectors but found no job listings`);
    console.log(`Last selector tried: ${usedSelector} (found ${foundElements} elements)`);
    
    // Try to find any job-related content
    const jobKeywords = ['job', 'position', 'career', 'employment', 'work'];
    console.log('\nSearching for job-related elements:');
    for (const keyword of jobKeywords) {
      const elements = $(`[class*=${keyword}], [id*=${keyword}]`);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with "${keyword}" in class/id`);
      }
    }
  }
  
  return jobListings;
}

/**
 * Extract job data from a job card element using provider-specific selectors
 * @param {Object} $ - Cheerio instance
 * @param {Object} element - Job card element
 * @param {Object} provider - Provider configuration
 * @returns {Object} - Extracted job data
 */
function extractJobData($, element, provider) {
  const job = {};
  
  // Extract title
  for (const titleSelector of provider.titleSelectors) {
    const titleElement = $(element).find(titleSelector);
    if (titleElement.length > 0) {
      job.title = titleElement.text().trim();
      if (!job.title && titleElement.attr('title')) {
        job.title = titleElement.attr('title').trim();
      }
      break;
    }
  }
  
  // Skip if no title found (probably not a job card)
  if (!job.title) return job;
  
  // Extract company name
  for (const companySelector of provider.companySelectors) {
    const companyElement = $(element).find(companySelector);
    if (companyElement.length > 0) {
      job.company = companyElement.text().trim();
      break;
    }
  }
  
  // Extract location
  for (const locationSelector of provider.locationSelectors) {
    const locationElement = $(element).find(locationSelector);
    if (locationElement.length > 0) {
      job.location = locationElement.text().trim();
      break;
    }
  }
  
  // Extract job snippet/description
  for (const snippetSelector of provider.snippetSelectors) {
    const snippetElement = $(element).find(snippetSelector);
    if (snippetElement.length > 0) {
      job.description = snippetElement.text().trim();
      break;
    }
  }
  
  // Extract salary if available
  for (const salarySelector of provider.salarySelectors) {
    const salaryElement = $(element).find(salarySelector);
    if (salaryElement.length > 0 && salaryElement.text().includes('$')) {
      job.salary = salaryElement.text().trim();
      break;
    }
  }
  
  // Extract posting date
  for (const dateSelector of provider.dateSelectors) {
    const dateElement = $(element).find(dateSelector);
    if (dateElement.length > 0) {
      job.posted = dateElement.text().trim();
      break;
    }
  }
  
  // Extract job URL
  const linkElement = $(element).find('a[href]').first();
  if (linkElement.length > 0) {
    const href = linkElement.attr('href');
    if (href) {
      job.url = provider.createUrl(href);
    }
  }
  
  // Add job ID if available
  if (job.url && provider.extractId) {
    const jobId = provider.extractId(job.url);
    if (jobId) {
      job.id = jobId;
    }
  }
  
  return job;
}

// Export the functions and configuration
module.exports = {
  parseJobsHTML,
  extractJobData,
  detectProvider,
  PROVIDERS,
  // Backwards compatibility
  parseIndeedHTML: (html, options) => parseJobsHTML(html, { ...options, provider: 'indeed' })
};