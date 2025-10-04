/**
 * Indeed Provider Module
 * 
 * This module handles fetching and parsing job listings from Indeed,
 * serving as a fallback when the primary USAJobs API doesn't return sufficient results.
 */
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Default headers that work well for Indeed
const DEFAULT_HEADERS = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  'pragma': 'no-cache',
  'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
};

/**
 * Build an Indeed search URL from parameters
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job search keywords
 * @param {string} params.location - Location (city, state, zip)
 * @param {number} params.radius - Search radius in miles
 * @param {number} params.limit - Maximum number of results
 * @returns {string} - Indeed search URL
 */
function buildSearchUrl(params) {
  // Base URL
  const baseUrl = 'https://www.indeed.com/jobs';
  
  // Build query string
  const queryParams = new URLSearchParams();
  
  // Add required parameters
  if (params.query) {
    queryParams.append('q', params.query);
  }
  
  if (params.location) {
    queryParams.append('l', params.location);
  }
  
  if (params.radius) {
    queryParams.append('radius', params.radius);
  }
  
  // Add optional parameters
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }
  
  // Add sort by date if specified
  if (params.sort === 'date') {
    queryParams.append('sort', 'date');
  }
  
  // Return the full URL
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Fetch Indeed job listings from a URL
 * @param {string} url - The Indeed search URL
 * @param {Object} options - Options for the fetch
 * @returns {Promise<string>} - Promise resolving to HTML content
 */
async function fetchIndeedHTML(url, options = {}) {
  try {
    if (options.verbose) {
      console.log(`Fetching Indeed results from: ${url}`);
    }
    
    // Merge default headers with any provided headers
    const headers = {
      ...DEFAULT_HEADERS,
      ...(options.headers || {})
    };
    
    // Fetch the HTML
    const response = await fetch(url, { 
      method: 'GET',
      headers,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Error fetching Indeed HTML: ${error.message}`);
  }
}

/**
 * Parse Indeed HTML and extract job listings
 * @param {string} html - The HTML content
 * @param {Object} options - Parsing options
 * @returns {Array} - Array of job listings
 */
function parseIndeedHTML(html, options = {}) {
  const $ = cheerio.load(html);
  const jobListings = [];
  const verbose = options.verbose || false;
  
  // Job card selectors to try
  const jobCardSelectors = [
    '.job_seen_beacon',
    '.jobsearch-ResultsList > div',
    '[data-testid="jobcardhovertrigger"]',
    '.jobCard',
    '.mosaic-provider-jobcards .mosaic-zone',
    '.cardOutline'
  ];
  
  // Try each selector until we find job cards
  for (const selector of jobCardSelectors) {
    const elements = $(selector);
    
    if (elements.length > 0) {
      if (verbose) {
        console.log(`Found ${elements.length} job cards with selector: ${selector}`);
      }
      
      // Process each job card
      elements.each((i, element) => {
        const job = extractJobData($, element);
        
        // Add source information
        job.source = 'Indeed';
        
        // Add to listings if it has a title
        if (job.title) {
          jobListings.push(job);
        }
      });
      
      // If we found job listings, break the loop
      if (jobListings.length > 0) {
        break;
      }
    }
  }
  
  return jobListings;
}

/**
 * Extract job data from a job card element
 * @param {Object} $ - Cheerio instance
 * @param {Object} element - Job card element
 * @returns {Object} - Extracted job data
 */
function extractJobData($, element) {
  const job = {};
  
  // Extract title
  const titleSelectors = ['h2.jobTitle', '.jcs-JobTitle', '[data-testid="jobTitle"]', 'h2.title', '.job-title', 'span[title]'];
  for (const titleSelector of titleSelectors) {
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
  const companySelectors = ['.companyName', '[data-testid="company-name"]', '.company', '.companyInfo span:first-child'];
  for (const companySelector of companySelectors) {
    const companyElement = $(element).find(companySelector);
    if (companyElement.length > 0) {
      job.company = companyElement.text().trim();
      break;
    }
  }
  
  // Extract location
  const locationSelectors = ['.companyLocation', '[data-testid="text-location"]', '.location', '.companyInfo .companyLocation'];
  for (const locationSelector of locationSelectors) {
    const locationElement = $(element).find(locationSelector);
    if (locationElement.length > 0) {
      job.location = locationElement.text().trim();
      break;
    }
  }
  
  // Extract job snippet/description
  const snippetSelectors = ['.job-snippet', '.summary', '.job-snippet-container', '.underShelfFooter div:not([class])'];
  for (const snippetSelector of snippetSelectors) {
    const snippetElement = $(element).find(snippetSelector);
    if (snippetElement.length > 0) {
      job.description = snippetElement.text().trim();
      break;
    }
  }
  
  // Extract salary if available
  const salarySelectors = ['.salary-snippet', '.salaryText', '[data-testid="salary-snippet"]', '.attribute_snippet', 'div[class^="salary"]'];
  for (const salarySelector of salarySelectors) {
    const salaryElement = $(element).find(salarySelector);
    if (salaryElement.length > 0 && salaryElement.text().includes('$')) {
      job.salary = salaryElement.text().trim();
      break;
    }
  }
  
  // Extract posting date
  const dateSelectors = ['.date', '.jobAge', '[data-testid="jobAge"]', '.result-footer .date', 'span.date'];
  for (const dateSelector of dateSelectors) {
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
      job.url = href.startsWith('/') ? `https://www.indeed.com${href}` : href;
    }
  }
  
  // Add job ID if available
  if (job.url) {
    const jobIdMatch = job.url.match(/jk=([a-f0-9]+)/);
    if (jobIdMatch && jobIdMatch[1]) {
      job.id = jobIdMatch[1];
    }
  }
  
  return job;
}

/**
 * Search for jobs on Indeed
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job search keywords
 * @param {string} params.location - Location (city, state, zip)
 * @param {number} params.radius - Search radius in miles
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Promise resolving to array of job listings
 */
async function searchJobs(params, options = {}) {
  try {
    // Build the search URL
    const url = buildSearchUrl(params);
    
    // Fetch the HTML
    const html = await fetchIndeedHTML(url, options);
    
    // Parse the HTML into job listings
    return parseIndeedHTML(html, options);
  } catch (error) {
    console.error('Indeed search error:', error.message);
    if (options.throwErrors) {
      throw error;
    }
    return [];
  }
}

module.exports = {
  searchJobs,
  fetchIndeedHTML,
  parseIndeedHTML,
  buildSearchUrl
};