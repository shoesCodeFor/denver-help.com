/**
 * Job Search API - Main entry point
 *
 * This module provides a unified API for job searching across multiple
 * providers with intelligent failover. It prioritizes USAJobs as the
 * primary source and falls back to Indeed when necessary.
 */
const analyzer = require('./analyzer');
const providerManager = require('./providers/manager');
const fetcher = require('./fetcher');

// Import individual providers for direct access if needed
const usaJobs = require('./providers/usajobs');
const indeed = require('./providers/indeed');

/**
 * Search for jobs across multiple providers with failover
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job search keywords
 * @param {string} params.location - Location (city, state, zip)
 * @param {number} params.radius - Search radius in miles (default: 25)
 * @param {string} params.provider - Primary provider to use ('usajobs' or 'indeed', default: 'usajobs')
 * @param {Object} options - Additional options
 * @param {number} options.minResultsThreshold - Minimum results before failover (default: 5)
 * @param {boolean} options.alwaysMergeResults - Always use both providers (default: false)
 * @param {boolean} options.skipFailover - Use only primary provider (default: false)
 * @param {boolean} options.verbose - Enable verbose logging (default: false)
 * @returns {Promise<Object>} - Promise resolving to search results
 */
async function searchJobs(params = {}, options = {}) {
  // Ensure required parameters
  if (!params.location) {
    throw new Error('Location parameter is required');
  }
  
  // Set default radius if not provided
  if (!params.radius) {
    params.radius = 25;
  }
  
  // Use provider manager to handle search with failover
  return providerManager.searchJobs(params, options);
}

/**
 * Parse job listings from a URL
 * @param {string} url - URL to job search page
 * @param {Object} options - Options for parsing
 * @returns {Promise<Array>} - Promise resolving to job listings
 */
async function parseJobsFromURL(url, options = {}) {
  try {
    let provider = options.provider;
    
    // If provider not specified, detect from URL
    if (!provider) {
      if (url.includes('usajobs.gov')) {
        provider = 'usajobs';
      } else if (url.includes('indeed.com')) {
        provider = 'indeed';
      } else {
        throw new Error('Unable to detect provider from URL');
      }
    }
    
    if (provider === 'usajobs') {
      // Handle USAJobs API URL
      // Extract parameters from URL if possible
      const params = {};
      try {
        const urlObj = new URL(url);
        params.keyword = urlObj.searchParams.get('keyword') || urlObj.searchParams.get('q');
        params.locationName = urlObj.searchParams.get('locationName') || urlObj.searchParams.get('l');
        params.radius = urlObj.searchParams.get('radius');
      } catch (e) {
        // If URL parsing fails, use the URL as is
        console.error('Error parsing USAJobs URL parameters:', e.message);
      }
      
      // Call USAJobs API
      const response = await usaJobs.searchJobs(params, options);
      return usaJobs.mapToStandardFormat(response);
    } else {
      // Fetch HTML for Indeed
      const html = await fetcher.fetchHTML(url, options);
      return indeed.parseIndeedHTML(html, options);
    }
  } catch (error) {
    throw new Error(`Error parsing jobs from URL: ${error.message}`);
  }
}

/**
 * Get job details by job ID
 * @param {string} jobId - The job ID to fetch
 * @param {string} provider - Provider name ('usajobs' or 'indeed')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Promise resolving to job details
 */
async function getJobDetails(jobId, provider = 'usajobs', options = {}) {
  if (provider === 'usajobs') {
    // Get job details from USAJobs API
    const response = await usaJobs.getJobDetails(jobId, options);
    const jobs = usaJobs.mapToStandardFormat(response);
    return jobs[0] || null;
  } else {
    // For Indeed, we'd need to fetch the job detail page
    throw new Error('Job detail fetching for Indeed is not implemented');
  }
}

/**
 * Search USAJobs directly
 * @param {Object} params - Search parameters
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Promise resolving to search results
 */
async function searchUSAJobs(params, options = {}) {
  // Map general parameters to USAJobs specific format
  const usaJobsParams = {
    keyword: params.query,
    locationName: params.location,
    radius: params.radius,
    resultsPerPage: options.limit || 25
  };
  
  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (!['query', 'location', 'radius'].includes(key)) {
      usaJobsParams[key] = value;
    }
  });
  
  // Call USAJobs API
  const response = await usaJobs.searchJobs(usaJobsParams, options);
  const jobs = usaJobs.mapToStandardFormat(response);
  
  return {
    success: jobs.length > 0,
    meta: {
      source: 'usajobs',
      count: jobs.length
    },
    jobs
  };
}

/**
 * Search Indeed directly
 * @param {Object} params - Search parameters
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Promise resolving to search results
 */
async function searchIndeed(params, options = {}) {
  try {
    const jobs = await indeed.searchJobs(params, options);
    
    return {
      success: jobs.length > 0,
      meta: {
        source: 'indeed',
        count: jobs.length
      },
      jobs
    };
  } catch (error) {
    throw new Error(`Indeed search error: ${error.message}`);
  }
}

// Export all functions
module.exports = {
  // Main API functions
  searchJobs,
  parseJobsFromURL,
  getJobDetails,
  
  // Direct provider access
  searchUSAJobs,
  searchIndeed,
  
  // Provider manager
  providerManager,
  
  // Analyzer module functions
  generateReport: analyzer.generateReport,
  getTopCompanies: analyzer.getTopCompanies,
  getJobsByLocation: analyzer.getJobsByLocation,
  getJobsWithSalary: analyzer.getJobsWithSalary,
  filterJobsByKeyword: analyzer.filterJobsByKeyword,
  sortJobs: analyzer.sortJobs,
  
  // Utility functions
  saveJobsToJSON: fetcher.saveJobsToJSON,
  
  // Individual providers
  providers: {
    usajobs: usaJobs,
    indeed
  }
};