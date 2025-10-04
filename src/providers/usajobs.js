/**
 * USAJobs API Client
 * 
 * This module provides functionality for interacting with the USAJobs API
 * to fetch federal job listings.
 * 
 * Documentation: https://developer.usajobs.gov/api-reference/
 */
const axios = require('axios');
require('dotenv').config();

// API Configuration
const API_HOST = 'data.usajobs.gov';
const BASE_URL = 'https://data.usajobs.gov/api/search';

// Use the API key directly instead of relying on environment variables
// that aren't being loaded properly
const API_KEY = "XM5EHKaxLVm+6p1li5Ohc9Fm5Y8OqDXxB/tj03iYdpY=";

console.log(`USAJobs API Key set directly in code (for testing only)`);

/**
 * Standard headers required for USAJobs API
 * @param {string} userAgent - User agent string identifying your application (email)
 * @returns {Object} - Headers object for requests
 */
function getHeaders(userAgent = 'your-email@example.com') {
  // Exactly match the headers format shown in the USAJobs API docs
  return {
    'Host': API_HOST,
    'User-Agent': userAgent,
    'Authorization-Key': API_KEY
  };
}

/**
 * Search for jobs on USAJobs
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Search keywords (job title, department, agency, etc.)
 * @param {string} params.locationName - City, state, or country
 * @param {string} params.postalCode - ZIP/Postal code for location search
 * @param {number} params.radius - Search radius in miles
 * @param {string} params.resultsPerPage - Number of results per page (default: 25, max: 500)
 * @param {string} params.page - Page number
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - API response
 */
function searchJobs(params, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Map parameter names to correct API parameter names
      const paramMap = {
        query: 'Keyword',
        keyword: 'Keyword',
        location: 'LocationName',
        locationName: 'LocationName',
        postalCode: 'PostalCode',
        radius: 'Radius',
        resultsPerPage: 'ResultsPerPage',
        page: 'Page',
        jobCategory: 'JobCategoryCode',
        agency: 'Organization',
        series: 'Series',
        graduateJob: 'GradLvl',
        payGrade: 'PayGrade',
        salaryMin: 'RemunerationMinimumAmount',
        salaryMax: 'RemunerationMaximumAmount',
        hiringPath: 'HiringPath',
        securityClearance: 'SecurityClearance'
      };
      
      // Build query parameters
      const queryParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const apiKey = paramMap[key] || key;
          queryParams[apiKey] = value;
        }
      });
      
      // Always log requests for debugging
      console.log('USAJobs API Request Parameters:', queryParams);
      console.log('USAJobs API Headers:', {
        'Host': API_HOST,
        'User-Agent': options.userAgent || 'your-email@example.com',
        'Authorization-Key': `${API_KEY.substring(0, 5)}...` // Partial key for security
      });
      
      // Make the API request using axios library
      axios({
        url: BASE_URL,
        method: 'GET',
        params: queryParams, // Note: 'params' in axios instead of 'qs'
        headers: getHeaders(options.userAgent)
      })
        .then(response => {
          console.log('USAJobs API response status:', response.status);
          
          const data = response.data; // Axios automatically parses JSON
          console.log('USAJobs API response parsed successfully');
          if (data.SearchResult) {
            console.log(`Found ${data.SearchResult.SearchResultCount} jobs`);
          }
          resolve(data);
        })
        .catch(error => {
          console.error('Request error:', error);
          if (error.response) {
            // The request was made and the server responded with a status code
            console.error('USAJobs API error response:', error.response.data);
            reject(new Error(`USAJobs API Error (${error.response.status}): ${error.response.data}`));
          } else {
            reject(new Error(`USAJobs API Error: ${error.message}`));
          }
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      reject(new Error(`USAJobs API Error: ${error.message}`));
    }
  });
}

/**
 * Get detailed information about a specific job
 * @param {string} jobId - USAJobs job ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Job details
 */
function getJobDetails(jobId, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const url = `https://data.usajobs.gov/api/job/${jobId}`;
      
      console.log(`USAJobs job details request: ${url}`);
      
      // Make the API request using axios library
      axios({
        url: url,
        method: 'GET',
        headers: getHeaders(options.userAgent)
      })
        .then(response => {
          resolve(response.data); // Axios automatically parses JSON
        })
        .catch(error => {
          if (error.response) {
            reject(new Error(`USAJobs API Error (${error.response.status}): ${error.response.data}`));
          } else {
            reject(new Error(`USAJobs API Error: ${error.message}`));
          }
        });
    } catch (error) {
      reject(new Error(`USAJobs API Error: ${error.message}`));
    }
  });
}

/**
 * Map USAJobs API response to standardized job format
 * @param {Object} usajobsResponse - Raw USAJobs API response
 * @returns {Array} - Array of standardized job objects
 */
function mapToStandardFormat(usajobsResponse) {
  try {
    const { SearchResult } = usajobsResponse;
    
    if (!SearchResult || !SearchResult.SearchResultItems) {
      return [];
    }
    
    // Map each job item to our standard format
    return SearchResult.SearchResultItems.map(item => {
      const job = item.MatchedObjectDescriptor;
      
      // Extract the position title, organization and location
      const title = job.PositionTitle || '';
      const company = job.OrganizationName || '';
      const locations = job.PositionLocation || [];
      const location = locations.length > 0 
        ? `${locations[0].LocationName}` 
        : '';
        
      // Extract salary information
      const remuneration = job.PositionRemuneration || [];
      const salary = remuneration.length > 0 
        ? `$${remuneration[0].MinimumRange} - $${remuneration[0].MaximumRange} ${remuneration[0].RateIntervalCode}`
        : '';
      
      // Format the job posting date
      const postedDate = job.PublicationStartDate 
        ? new Date(job.PublicationStartDate).toLocaleDateString()
        : '';
        
      // Create a standardized job object
      return {
        id: job.PositionID,
        title,
        company,
        location,
        description: job.QualificationSummary || '',
        salary,
        posted: postedDate ? `Posted ${postedDate}` : '',
        url: job.PositionURI,
        source: 'USAJobs',
        // Additional USAJobs specific fields
        departmentName: job.DepartmentName || '',
        jobGrade: job.JobGrade && job.JobGrade.length > 0 ? job.JobGrade[0].Code : '',
        applyBy: job.ApplicationCloseDate 
          ? new Date(job.ApplicationCloseDate).toLocaleDateString()
          : ''
      };
    });
  } catch (error) {
    console.error('Error mapping USAJobs response:', error);
    return [];
  }
}

module.exports = {
  searchJobs,
  getJobDetails,
  mapToStandardFormat
};