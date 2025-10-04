/**
 * Indeed Parser - Job data analyzer
 * 
 * This module contains functions for analyzing and extracting insights
 * from job listing data.
 */

/**
 * Get the top companies by job count
 * @param {Array} jobs - Array of job listings
 * @param {Number} limit - Max number of companies to return
 * @returns {Array} - Array of [company, count] tuples
 */
function getTopCompanies(jobs, limit = 5) {
  const companyCount = {};
  
  jobs.forEach(job => {
    if (job.company) {
      companyCount[job.company] = (companyCount[job.company] || 0) + 1;
    }
  });
  
  return Object.entries(companyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

/**
 * Get job distribution by location
 * @param {Array} jobs - Array of job listings
 * @param {Number} limit - Max number of locations to return
 * @returns {Array} - Array of [location, count] tuples
 */
function getJobsByLocation(jobs, limit = 5) {
  const locationCount = {};
  
  jobs.forEach(job => {
    if (job.location) {
      locationCount[job.location] = (locationCount[job.location] || 0) + 1;
    }
  });
  
  return Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

/**
 * Get jobs with salary information
 * @param {Array} jobs - Array of job listings
 * @returns {Object} - Object with count and percentage
 */
function getJobsWithSalary(jobs) {
  const jobsWithSalary = jobs.filter(job => job.salary);
  
  return {
    count: jobsWithSalary.length,
    percentage: Math.round((jobsWithSalary.length / jobs.length) * 100),
    jobs: jobsWithSalary
  };
}

/**
 * Filter jobs by keyword in title or description
 * @param {Array} jobs - Array of job listings
 * @param {String} keyword - Keyword to search for
 * @param {Boolean} caseSensitive - Whether the search should be case sensitive
 * @returns {Array} - Array of matching jobs
 */
function filterJobsByKeyword(jobs, keyword, caseSensitive = false) {
  return jobs.filter(job => {
    const title = job.title || '';
    const description = job.description || '';
    
    if (caseSensitive) {
      return title.includes(keyword) || description.includes(keyword);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      return title.toLowerCase().includes(lowerKeyword) || 
             description.toLowerCase().includes(lowerKeyword);
    }
  });
}

/**
 * Sort jobs by a specific property
 * @param {Array} jobs - Array of job listings
 * @param {String} property - Property to sort by
 * @param {Boolean} ascending - Whether to sort ascending
 * @returns {Array} - Sorted array of jobs
 */
function sortJobs(jobs, property, ascending = true) {
  return [...jobs].sort((a, b) => {
    const aValue = a[property] || '';
    const bValue = b[property] || '';
    
    return ascending ? 
      aValue.localeCompare(bValue) : 
      bValue.localeCompare(aValue);
  });
}

/**
 * Generate a report object with key insights
 * @param {Array} jobs - Array of job listings
 * @returns {Object} - Report object with various insights
 */
function generateReport(jobs) {
  return {
    totalJobs: jobs.length,
    topCompanies: getTopCompanies(jobs),
    locationDistribution: getJobsByLocation(jobs),
    salaryStats: getJobsWithSalary(jobs),
    recentPostings: sortJobs(jobs.filter(j => j.posted), 'posted', false).slice(0, 5),
    sample: jobs.slice(0, 3)
  };
}

module.exports = {
  getTopCompanies,
  getJobsByLocation,
  getJobsWithSalary,
  filterJobsByKeyword,
  sortJobs,
  generateReport
};