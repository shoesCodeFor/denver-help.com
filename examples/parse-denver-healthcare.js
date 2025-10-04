/**
 * Example: Parse Denver healthcare jobs using the API server
 * 
 * This example demonstrates how to use the Indeed Parser API server
 * to parse healthcare jobs in Denver, CO.
 */
const fetch = require('node-fetch');

// Define the API endpoint (assumes the server is running)
const API_URL = 'http://localhost:3000/api/parse/denver-healthcare';

/**
 * Fetch and display Denver healthcare jobs
 */
async function fetchDenverHealthcareJobs() {
  console.log('Fetching Denver healthcare jobs from the API server...');
  
  try {
    // Make the API request
    const response = await fetch(API_URL);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Display the results
    console.log(`\nSuccessfully retrieved ${data.count} Denver healthcare jobs`);
    
    // Display top companies
    console.log('\nTop companies hiring:');
    data.stats.topCompanies.forEach(([company, count]) => {
      console.log(`- ${company}: ${count} jobs`);
    });
    
    // Display salary information
    console.log(`\nJobs with salary info: ${data.stats.salaryInfo.count} (${data.stats.salaryInfo.percentage}%)`);
    
    // Display sample job listings
    console.log('\nSample job listings:');
    data.jobs.slice(0, 3).forEach((job, index) => {
      console.log(`\n--- Job ${index + 1} ---`);
      console.log(`Title: ${job.title}`);
      console.log(`Company: ${job.company || 'N/A'}`);
      console.log(`Location: ${job.location || 'N/A'}`);
      if (job.salary) console.log(`Salary: ${job.salary}`);
      if (job.description) console.log(`Description: ${job.description.substring(0, 100)}...`);
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching Denver healthcare jobs:', error.message);
  }
}

// Execute the example if run directly
if (require.main === module) {
  // First check if the server is running
  fetch('http://localhost:3000/health')
    .then(response => {
      if (response.ok) {
        console.log('Server is running. Fetching jobs...\n');
        fetchDenverHealthcareJobs();
      } else {
        console.error('Server is not responding correctly. Please start the server first:');
        console.error('  node server.js');
      }
    })
    .catch(error => {
      console.error('Server is not running. Please start the server first:');
      console.error('  node server.js');
      console.error('\nError details:', error.message);
    });
}

// Export for use in other examples
module.exports = { fetchDenverHealthcareJobs };