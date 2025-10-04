/**
 * USAJobs API Test Script
 * 
 * This simple script tests the USAJobs API directly using the request library
 * to verify our implementation approach.
 */
const request = require('request');

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
function testUSAJobsAPI() {
  console.log('Sending request...');
  
  // Make the API request using request library
  request({
    url: 'https://data.usajobs.gov/api/search',
    method: 'GET',
    qs: params,
    headers: {
      'Host': API_HOST,
      'User-Agent': USER_AGENT,
      'Authorization-Key': API_KEY
    }
  }, function(error, response, body) {
    if (error) {
      console.error('Error making request:', error);
      return;
    }
    
    console.log('Response status:', response.statusCode);
    console.log('Response headers:', response.headers);
    
    if (response.statusCode !== 200) {
      console.error('Error response body:', body);
      console.error(`USAJobs API Error (${response.statusCode})`);
      return;
    }
    
    try {
      const data = JSON.parse(body);
      
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
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
    }
  });
}

// Run the test
testUSAJobsAPI();