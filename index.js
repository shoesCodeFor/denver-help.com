#!/usr/bin/env node
/**
 * Job Search API - Main Entry Point
 *
 * A robust job search API that prioritizes the USAJobs API as the primary source
 * with Indeed scraping as a failover mechanism. This approach combines the stability
 * and reliability of an official API with the breadth of a web scraping solution.
 *
 * Example API usage:
 *   const jobSearch = require('./index');
 *
 *   // Search with automatic provider selection and failover
 *   const results = await jobSearch.searchJobs({
 *     query: 'software engineer',
 *     location: 'Denver, CO',
 *     radius: 25
 *   });
 *
 *   // Search with specific provider
 *   const federalJobs = await jobSearch.searchUSAJobs({
 *     query: 'software engineer',
 *     location: 'Denver, CO'
 *   });
 */

// Load environment variables from .env file
require('dotenv').config();

// Import the core module
const jobSearch = require('./src/index');

// CLI functionality
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Handle command in async function
  async function runCLI() {
    try {
      // Display help if no arguments or help flag
      if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log('Job Search API - Command Line Interface\n');
        console.log('Usage:');
        console.log('  node index.js --search query="job title" location="city, state" [radius=25] [provider=usajobs]');
        console.log('  node index.js --url <job-listing-url>');
        console.log('\nExamples:');
        console.log('  node index.js --search query="software engineer" location="Denver, CO" radius=50');
        console.log('  node index.js --search query="nurse" location="Seattle, WA" provider=indeed');
        console.log('  node index.js --url https://www.usajobs.gov/Search/Results?k=software');
        return;
      }
      
      let results;
      
      if (args[0] === '--search') {
        // Parse search parameters
        const params = {};
        const options = { verbose: true };
        
        // Extract all parameters after --search
        for (let i = 1; i < args.length; i++) {
          const arg = args[i];
          const match = arg.match(/([^=]+)=(.+)/);
          if (match) {
            const [, key, value] = match;
            if (key === 'provider' || key === 'verbose' || key === 'skipFailover') {
              options[key] = value;
            } else {
              params[key] = value;
            }
          }
        }
        
        // Validate required parameters
        if (!params.location) {
          console.error('Error: location parameter is required');
          process.exit(1);
        }
        
        console.log(`Searching for jobs: "${params.query || ''}" in ${params.location}`);
        console.log(`Primary provider: ${options.provider || 'usajobs'} (failover: ${options.skipFailover ? 'disabled' : 'enabled'})`);
        
        // Run the search
        results = await jobSearch.searchJobs(params, options);
      }
      else if (args[0] === '--url') {
        if (args.length < 2) {
          console.error('Error: URL is required with --url flag');
          process.exit(1);
        }
        
        const url = args[1];
        console.log(`Fetching and parsing jobs from URL: ${url}`);
        
        // Parse jobs from URL
        const jobs = await jobSearch.parseJobsFromURL(url, { verbose: true });
        
        results = {
          success: true,
          meta: {
            url,
            count: jobs.length
          },
          jobs
        };
      }
      else {
        console.error('Error: Unknown command. Use --help for usage information');
        process.exit(1);
      }
      
      // Output results
      if (results && results.jobs.length > 0) {
        console.log('\n=== Job Search Results ===');
        console.log(`Found ${results.jobs.length} job listings`);
        
        if (results.meta.sources) {
          console.log(`Sources: ${results.meta.sources.join(', ')}`);
        }
        
        // Generate a report
        const report = jobSearch.generateReport(results.jobs);
        
        // Show top companies
        console.log('\nTop companies:');
        report.topCompanies.forEach(([company, count]) => {
          console.log(`- ${company}: ${count} jobs`);
        });
        
        // Show sample job listings
        console.log('\nSample job listings:');
        results.jobs.slice(0, 3).forEach((job, index) => {
          console.log(`\n--- Job ${index + 1} ---`);
          console.log(`Title: ${job.title}`);
          console.log(`Company: ${job.company || 'N/A'}`);
          console.log(`Location: ${job.location || 'N/A'}`);
          if (job.salary) console.log(`Salary: ${job.salary}`);
          console.log(`Source: ${job.source}`);
        });
        
        console.log('\nTotal jobs found:', results.jobs.length);
      } else {
        console.log('No job listings found. Try adjusting your search parameters.');
        
        // Check if there were any errors
        if (results && results.meta && results.meta.errors) {
          console.log('\nErrors encountered:');
          results.meta.errors.forEach(err => {
            console.log(`- ${err.provider}: ${err.error}`);
          });
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
  
  // Run the CLI
  runCLI().catch(console.error);
}

// Export the API for use in applications
module.exports = jobSearch;