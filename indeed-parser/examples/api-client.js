#!/usr/bin/env node
/**
 * Indeed API Client Example
 * 
 * This script demonstrates how to use the Indeed API to search for jobs.
 */
const fetch = require('node-fetch');

// Base URL of the API server
const API_BASE_URL = 'http://localhost:3000';

/**
 * Search for jobs using the API
 * @param {string} city - City to search in (e.g. "Denver, CO")
 * @param {number} radius - Radius in miles (default: 25)
 * @param {string} query - Job search query (default: "")
 * @returns {Promise<Object>} - API response
 */
async function searchJobs(city, radius = 25, query = '') {
  // Build the URL with query parameters
  const url = `${API_BASE_URL}/api/jobs?city=${encodeURIComponent(city)}&radius=${radius}${query ? `&query=${encodeURIComponent(query)}` : ''}`;
  
  console.log(`Searching for jobs: ${url}`);
  
  try {
    // Make the API request
    const response = await fetch(url);
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error (${response.status})`);
    }
    
    // Parse and return the response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching for jobs:', error.message);
    throw error;
  }
}

/**
 * Display search results in a human-readable format
 * @param {Object} results - API response
 */
function displayResults(results) {
  console.log('\n===== JOB SEARCH RESULTS =====\n');
  console.log(`Found ${results.count} jobs matching your criteria`);
  console.log(`Search URL: ${results.url}`);
  
  // Display top companies
  console.log('\n----- TOP COMPANIES -----');
  results.stats.topCompanies.forEach(([company, count]) => {
    console.log(`${company}: ${count} jobs`);
  });
  
  // Display salary information
  console.log('\n----- SALARY INFO -----');
  console.log(`Jobs with salary: ${results.stats.salaryInfo.count} (${results.stats.salaryInfo.percentage}%)`);
  
  // Display first 5 jobs
  console.log('\n----- JOB LISTINGS -----');
  results.jobs.slice(0, 5).forEach((job, index) => {
    console.log(`\n[${index + 1}] ${job.title}`);
    console.log(`    Company: ${job.company || 'Not specified'}`);
    console.log(`    Location: ${job.location || 'Not specified'}`);
    if (job.salary) console.log(`    Salary: ${job.salary}`);
    if (job.posted) console.log(`    Posted: ${job.posted}`);
    if (job.description) console.log(`    Description: ${job.description.substring(0, 100)}...`);
    if (job.url) console.log(`    URL: ${job.url}`);
  });
  
  console.log('\n==============================\n');
}

// Example searches to run if this script is executed directly
async function runExamples() {
  try {
    // First check if the server is running
    const healthCheck = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    
    if (!healthCheck || !healthCheck.ok) {
      console.error('Error: API server is not running.');
      console.error('Start the server with: node server.js');
      return;
    }
    
    console.log('API server is running. Executing example searches...\n');
    
    // Example 1: Search for healthcare jobs in Denver
    console.log('EXAMPLE 1: Healthcare jobs in Denver, CO (25 mile radius)');
    const denverHealthcare = await searchJobs('Denver, CO', 25, 'healthcare');
    displayResults(denverHealthcare);
    
    // Example 2: Search for tech jobs in Seattle
    console.log('EXAMPLE 2: Tech jobs in Seattle, WA (10 mile radius)');
    const seattleTech = await searchJobs('Seattle, WA', 10, 'software');
    displayResults(seattleTech);
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// If this script is run directly (not imported), run the examples
if (require.main === module) {
  runExamples();
}

// Export the functions for use in other scripts
module.exports = {
  searchJobs,
  displayResults
};