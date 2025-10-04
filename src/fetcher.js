/**
 * Indeed Parser - HTML content fetchers
 *
 * This module contains functions for fetching HTML content from URLs and files
 * using cross-platform fetch API instead of curl.
 */
const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Default headers that work well for most job listing sites
 */
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
 * Fetches HTML content from a URL using fetch
 * @param {string} url - The URL to fetch
 * @param {Object} options - Options for the fetch
 * @param {Object} options.headers - Headers to include (will be merged with defaults)
 * @param {boolean} options.verbose - Whether to log verbose output
 * @returns {Promise<string>} - Promise resolving to the HTML content
 */
async function fetchHTML(url, options = {}) {
  try {
    if (options.verbose) {
      console.log(`Fetching HTML from ${url}...`);
    }
    
    // Merge default headers with any provided headers
    const headers = {
      ...DEFAULT_HEADERS,
      ...(options.headers || {})
    };
    
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
    throw new Error(`Error fetching HTML: ${error.message}`);
  }
}

/**
 * Reads HTML content from a file
 * @param {string} filePath - Path to the HTML file
 * @param {Object} options - Options for reading
 * @param {boolean} options.verbose - Whether to log verbose output
 * @returns {string} - The HTML content
 * @throws {Error} - If the file cannot be read
 */
function readHTML(filePath, options = {}) {
  try {
    if (options.verbose) {
      console.log(`Reading HTML from ${filePath}...`);
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}

/**
 * Saves HTML content to a file
 * @param {string} html - The HTML content to save
 * @param {string} filePath - Path to save the HTML file
 * @param {Object} options - Options for saving
 * @param {boolean} options.verbose - Whether to log verbose output
 * @returns {boolean} - True if successful
 * @throws {Error} - If the file cannot be written
 */
function saveHTML(html, filePath, options = {}) {
  try {
    if (options.verbose) {
      console.log(`Saving HTML to ${filePath}...`);
    }
    fs.writeFileSync(filePath, html);
    return true;
  } catch (error) {
    throw new Error(`Error saving HTML to ${filePath}: ${error.message}`);
  }
}

/**
 * Saves job listings to a JSON file
 * @param {Array} jobs - Array of job listings
 * @param {string} filePath - Path to save the JSON file
 * @param {Object} options - Options for saving
 * @param {boolean} options.verbose - Whether to log verbose output
 * @returns {boolean} - True if successful
 * @throws {Error} - If the file cannot be written
 */
function saveJobsToJSON(jobs, filePath, options = {}) {
  try {
    if (options.verbose) {
      console.log(`Saving ${jobs.length} jobs to ${filePath}...`);
    }
    fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2));
    return true;
  } catch (error) {
    throw new Error(`Error saving jobs to ${filePath}: ${error.message}`);
  }
}

module.exports = {
  fetchHTML,
  readHTML,
  saveHTML,
  saveJobsToJSON,
  DEFAULT_HEADERS
};