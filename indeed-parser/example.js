#!/usr/bin/env node
/**
 * Example usage of the Indeed Parser API
 * 
 * This file demonstrates different ways to use the parser
 * programmatically in your own applications.
 */
const indeedParser = require('./index.js');

// Example 1: Parse from URL
async function parseFromURL() {
  console.log('Example 1: Parse Indeed jobs from URL');
  try {
    // You can customize the search parameters in the URL
    const url = 'https://www.indeed.com/jobs?q=healthcare&l=Denver%2C%20CO&radius=25';
    console.log(`Parsing jobs from URL: ${url}`);
    
    const jobs = indeedParser.parseIndeedURL(url, { verbose: false });
    console.log(`Found ${jobs.length} jobs`);
    
    // You can now process the jobs as needed
    console.log('First job:', jobs[0]);
    
    // Example of filtering jobs by keyword
    const filteredJobs = jobs.filter(job => 
      job.title.toLowerCase().includes('nurse') || 
      (job.description && job.description.toLowerCase().includes('nurse'))
    );
    
    console.log(`Found ${filteredJobs.length} nursing jobs`);
    return jobs;
  } catch (error) {
    console.error('Error parsing from URL:', error.message);
  }
}

// Example 2: Parse from HTML file
function parseFromFile(filePath) {
  console.log('\nExample 2: Parse Indeed jobs from HTML file');
  try {
    console.log(`Parsing jobs from file: ${filePath}`);
    
    const jobs = indeedParser.parseIndeedFile(filePath);
    console.log(`Found ${jobs.length} jobs`);
    
    // Example of sorting jobs by company name
    const sortedJobs = [...jobs].sort((a, b) => 
      (a.company || '').localeCompare(b.company || '')
    );
    
    console.log('Jobs sorted by company name:');
    sortedJobs.slice(0, 3).forEach(job => {
      console.log(`- ${job.company}: ${job.title}`);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error parsing from file:', error.message);
  }
}

// Example 3: Advanced usage - Custom data processing
function processJobData(jobs) {
  console.log('\nExample 3: Advanced processing of job data');
  
  // Count jobs by company
  const companyCounts = {};
  jobs.forEach(job => {
    const company = job.company || 'Unknown';
    companyCounts[company] = (companyCounts[company] || 0) + 1;
  });
  
  // Get top companies
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('Top 5 companies by job count:');
  topCompanies.forEach(([company, count]) => {
    console.log(`- ${company}: ${count} jobs`);
  });
  
  // Extract salary information where available
  const salaryJobs = jobs.filter(job => job.salary);
  console.log(`Jobs with salary information: ${salaryJobs.length} (${Math.round(salaryJobs.length / jobs.length * 100)}%)`);
  
  if (salaryJobs.length > 0) {
    console.log('Sample salary information:');
    salaryJobs.slice(0, 3).forEach(job => {
      console.log(`- ${job.title}: ${job.salary}`);
    });
  }
}

// Run the examples
async function main() {
  try {
    // Example 1: Parse from URL
    const jobs = await parseFromURL();
    
    if (jobs && jobs.length > 0) {
      // Example 2: Save to file and parse from file
      const fs = require('fs');
      const filePath = 'example-indeed.html';
      
      // Get raw HTML from a simpler curl command for demonstration
      const { execSync } = require('child_process');
      const html = execSync(
        `curl 'https://www.indeed.com/jobs?q=healthcare&l=Denver%2C%20CO' -H 'User-Agent: Mozilla/5.0'`, 
        { encoding: 'utf8' }
      );
      
      // Save HTML to file
      fs.writeFileSync(filePath, html);
      console.log(`Saved HTML to ${filePath}`);
      
      // Parse from the saved file
      const fileJobs = parseFromFile(filePath);
      
      // Example 3: Process the job data
      if (fileJobs && fileJobs.length > 0) {
        processJobData(fileJobs);
      }
    }
    
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}