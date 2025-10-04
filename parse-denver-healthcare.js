#!/usr/bin/env node
/**
 * This script demonstrates parsing Indeed job listings from the exact 
 * curl command provided in the original request.
 */
const indeedParser = require('./index.js');
const fs = require('fs');

// The exact curl command from the request
const originalCurlCommand = `curl 'https://www.indeed.com/jobs?q=healthcare&l=Denver%2C%20CO&radius=25&from=searchOnDesktopSerp' \\
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \\
  -H 'accept-language: en-US,en;q=0.9' \\
  -H 'cache-control: no-cache' \\
  -H 'pragma: no-cache' \\
  -H 'referer: https://www.indeed.com/jobs?q=healthcare&l=Denver%2C+CO&from=searchOnHP%2Cwhatautocomplete%2CwhatautocompleteSourceStandard&vjk=04bf1f88bcb91778' \\
  -H 'sec-ch-ua: "Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  -H 'sec-fetch-dest: document' \\
  -H 'sec-fetch-mode: navigate' \\
  -H 'sec-fetch-site: same-origin' \\
  -H 'sec-fetch-user: ?1' \\
  -H 'upgrade-insecure-requests: 1' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'`;

// We'll do this in a couple of ways
async function main() {
  console.log('=== Indeed Denver Healthcare Job Parser ===');
  console.log('This script demonstrates parsing the exact curl command from the request');

  // Method 1: Use the parser's command-line interface
  console.log('\n=== Method 1: Using Parser CLI ===');
  try {
    console.log('Executing curl command and parsing results...');
    // Use our fetchIndeedHTML function to get the HTML
    const html = indeedParser.fetchIndeedHTML(originalCurlCommand);
    
    // Parse the HTML to extract job listings
    const jobListings = indeedParser.parseIndeedHTML(html, { verbose: true });
    
    // Save results to file
    const outputFile = 'denver-healthcare-jobs.json';
    fs.writeFileSync(outputFile, JSON.stringify(jobListings, null, 2));
    
    console.log(`\nExtracted ${jobListings.length} jobs from Denver healthcare search`);
    console.log(`Results saved to ${outputFile}`);
    
    // Print a sample of the extracted jobs
    if (jobListings.length > 0) {
      console.log('\nSample job listings:');
      jobListings.slice(0, 3).forEach((job, index) => {
        console.log(`\n--- Job ${index + 1} ---`);
        console.log(`Title: ${job.title}`);
        console.log(`Company: ${job.company || 'N/A'}`);
        console.log(`Location: ${job.location || 'N/A'}`);
        if (job.salary) console.log(`Salary: ${job.salary}`);
        if (job.description) console.log(`Description: ${job.description.substring(0, 100)}...`);
        console.log(`URL: ${job.url || 'N/A'}`);
      });

      // Method 2: Demonstrate some analysis on the data
      console.log('\n=== Method 2: Data Analysis ===');
      
      // Count jobs by company
      const companyCount = {};
      jobListings.forEach(job => {
        if (job.company) {
          companyCount[job.company] = (companyCount[job.company] || 0) + 1;
        }
      });
      
      // Sort companies by job count
      const topCompanies = Object.entries(companyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      console.log('\nTop Companies Hiring in Denver Healthcare:');
      topCompanies.forEach(([company, count]) => {
        console.log(`- ${company}: ${count} jobs`);
      });
      
      // Count jobs with salary information
      const jobsWithSalary = jobListings.filter(job => job.salary).length;
      console.log(`\nJobs with salary information: ${jobsWithSalary} (${Math.round(jobsWithSalary/jobListings.length*100)}%)`);
      
      // Group jobs by location
      const locationGroups = {};
      jobListings.forEach(job => {
        if (job.location) {
          locationGroups[job.location] = (locationGroups[job.location] || 0) + 1;
        }
      });
      
      console.log('\nJob Distribution by Location:');
      Object.entries(locationGroups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([location, count]) => {
          console.log(`- ${location}: ${count} jobs`);
        });
    } else {
      console.log('\nNo jobs found. The page structure may have changed or there could be anti-scraping measures.');
    }
  } catch (error) {
    console.error('Error parsing Indeed jobs:', error.message);
  }
}

// Run the demonstration
main().catch(console.error);