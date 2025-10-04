/**
 * USAJobs API Test Script
 * 
 * This simple script tests the USAJobs API directly using the request library
 * to verify our implementation approach.
 */
const axios = require('axios');

// Configuration
const API_HOST = 'data.usajobs.gov';
const API_KEY = "XM5EHKaxLVm+6p1li5Ohc9Fm5Y8OqDXxB/tj03iYdpY=";
const USER_AGENT = "your-email@example.com";

// Test parameters
const params = {
  Keyword: "software engineer",
  LocationName: "Denver, CO",
  Radius: 25,
  ResultsPerPage: 10
};

console.log('=== USAJobs API Test ===');
console.log('Test URL: https://data.usajobs.gov/api/search');
console.log('Query parameters:', params);
console.log('Headers:', {
  'Host': API_HOST,
  'User-Agent': USER_AGENT,
  'Authorization-Key': `${API_KEY.substring(0, 5)}...` // Partial key for security
});

// Make the API request
async function testUSAJobsAPI() {
  console.log('Sending request...');
  
  try {
    // Make the API request using axios library
    const response = await axios({
      url: 'https://data.usajobs.gov/api/search',
      method: 'GET',
      params: params, // Note: 'params' in axios instead of 'qs'
      headers: {
        'Host': API_HOST,
        'User-Agent': USER_AGENT,
        'Authorization-Key': API_KEY
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // Axios automatically parses JSON
    const data = response.data;
    
    console.log('\n=== API Response ===');
    console.log('SearchResult.SearchResultCount:', data.SearchResult?.SearchResultCount);
    console.log('Number of items:', data.SearchResult?.SearchResultItems?.length);
    
    if (data.SearchResult?.SearchResultItems?.length > 0) {
      const firstJob = data.SearchResult.SearchResultItems[0].MatchedObjectDescriptor;
      console.log('\nSample job:');
      console.log('- Title:', firstJob.PositionTitle);
      console.log('- Organization:', firstJob.OrganizationName);
      console.log('- Location:',
        firstJob.PositionLocation && firstJob.PositionLocation.length > 0
          ? firstJob.PositionLocation[0].LocationName
          : 'N/A'
      );
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the 2xx range
      console.error('Error response status:', error.response.status);
      console.error('Error response body:', error.response.data);
      console.error(`USAJobs API Error (${error.response.status})`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error making request (no response received):', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error making request:', error.message);
    }
  }
}

// Run the test
testUSAJobsAPI();