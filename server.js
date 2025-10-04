/**
 * Job Search API Server
 *
 * A robust Express API for job searching with USAJobs as primary source
 * and Indeed scraping as failover.
 */
// Load environment variables from .env file
require('dotenv').config();

// Verify that USAJobs API key is loaded
if (process.env.US_JOBS_API_KEY) {
  const maskedKey = process.env.US_JOBS_API_KEY.substring(0, 5) + '...' +
                    process.env.US_JOBS_API_KEY.substring(process.env.US_JOBS_API_KEY.length - 5);
  console.log(`USAJobs API Key loaded: ${maskedKey}`);
} else {
  console.warn('WARNING: US_JOBS_API_KEY not found in environment variables');
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jobSearch = require('./index');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = '1.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  // Check if USAJobs API key is configured
  const usaJobsConfigured = !!process.env.US_JOBS_API_KEY;
  
  res.json({
    status: 'healthy',
    version: VERSION,
    providers: {
      usajobs: {
        available: usaJobsConfigured,
        primary: true
      },
      indeed: {
        available: true,
        primary: false
      }
    }
  });
});

/**
 * API information
 * GET /api
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Job Search API',
    version: VERSION,
    description: 'Search for jobs across multiple providers with USAJobs as primary and Indeed as failover',
    endpoints: [
      {
        path: '/api/jobs',
        method: 'GET',
        description: 'Search for jobs by location, query, and radius',
        params: ['location (required)', 'query', 'radius', 'provider', 'skipFailover', 'limit']
      },
      {
        path: '/api/usajobs',
        method: 'GET',
        description: 'Search USAJobs directly',
        params: ['location (required)', 'query', 'radius', 'limit']
      },
      {
        path: '/api/indeed',
        method: 'GET',
        description: 'Search Indeed directly (fallback provider)',
        params: ['location (required)', 'query', 'radius', 'limit']
      },
      {
        path: '/api/providers',
        method: 'GET',
        description: 'List available job providers and their status'
      }
    ]
  });
});

/**
 * List available providers and their status
 * GET /api/providers
 */
app.get('/api/providers', (req, res) => {
  // Check if USAJobs API key is configured
  const usaJobsConfigured = !!process.env.US_JOBS_API_KEY;
  
  res.json({
    success: true,
    providers: {
      usajobs: {
        name: 'USAJobs',
        description: 'Official US government job board',
        available: usaJobsConfigured,
        primary: true,
        features: ['Official API', 'Comprehensive federal job listings', 'Detailed job information']
      },
      indeed: {
        name: 'Indeed',
        description: 'Web scraping fallback for private sector jobs',
        available: true,
        primary: false,
        features: ['Wide range of private sector jobs', 'Used as failover when USAJobs returns insufficient results']
      }
    },
    failoverStrategy: {
      description: 'The API uses USAJobs as primary source and falls back to Indeed when necessary',
      triggerThreshold: 5, // Minimum USAJobs results before triggering failover
      canDisable: true // Failover can be disabled with skipFailover=true
    }
  });
});

/**
 * Search for jobs across providers with failover
 * GET /api/jobs?location=Denver,%20CO&radius=25&query=healthcare&provider=usajobs&skipFailover=false
 */
app.get('/api/jobs', async (req, res) => {
  try {
    // Get parameters from query string
    const {
      location,
      radius = 25,
      query = '',
      provider = 'usajobs', // Default to USAJobs
      skipFailover = false,
      limit = 100
    } = req.query;
    
    // Validate required parameters
    if (!location) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'The location parameter is required'
      });
    }
    
    console.log(`Searching for jobs: "${query}" in ${location} within ${radius} miles`);
    console.log(`Primary: ${provider}, Failover: ${skipFailover === 'true' ? 'disabled' : 'enabled'}`);
    
    // Search for jobs with the given parameters
    const results = await jobSearch.searchJobs({
      query,
      location,
      radius: parseInt(radius, 10)
    }, {
      primaryProvider: provider,
      skipFailover: skipFailover === 'true', // Convert string param to boolean
      maxResults: parseInt(limit, 10),
      verbose: false
    });
    
    // Generate a report with analytics if we have results
    if (results.jobs.length > 0) {
      const report = jobSearch.generateReport(results.jobs);
      
      // Add report data to the results
      results.stats = {
        topCompanies: report.topCompanies,
        locationDistribution: report.locationDistribution,
        salaryInfo: {
          count: report.salaryStats.count,
          percentage: report.salaryStats.percentage
        }
      };
    }
    
    // Return the results
    res.json(results);
  } catch (error) {
    console.error('Error processing job request:', error);
    res.status(500).json({
      success: false,
      error: 'job_search_error',
      message: error.message
    });
  }
});

/**
 * Search USAJobs directly
 * GET /api/usajobs?location=Denver,%20CO&radius=25&query=healthcare
 */
app.get('/api/usajobs', async (req, res) => {
  try {
    // Log the request for debugging
    console.log('USAJobs API Request:', req.url);
    console.log('Query parameters:', req.query);
    
    // Get parameters from query string
    const {
      location,
      radius = 25,
      query = '',
      limit = 100
    } = req.query;
    
    // Validate required parameters
    if (!location) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'The location parameter is required'
      });
    }
    
    console.log(`Searching USAJobs for: "${query}" in ${location} within ${radius} miles`);
    
    // Search for jobs with the given parameters
    const results = await jobSearch.searchUSAJobs({
      query,
      location,
      radius: parseInt(radius, 10)
    }, {
      limit: parseInt(limit, 10)
    });
    
    // Generate a report with analytics if we have results
    if (results.jobs.length > 0) {
      const report = jobSearch.generateReport(results.jobs);
      
      // Add report data to the results
      results.stats = {
        topCompanies: report.topCompanies,
        locationDistribution: report.locationDistribution,
        salaryInfo: {
          count: report.salaryStats.count,
          percentage: report.salaryStats.percentage
        }
      };
    }
    
    // Return the results
    res.json(results);
  } catch (error) {
    console.error('Error processing USAJobs request:', error);
    res.status(500).json({
      success: false,
      error: 'usajobs_error',
      message: error.message
    });
  }
});

/**
 * Search Indeed directly
 * GET /api/indeed?location=Denver,%20CO&radius=25&query=healthcare
 */
app.get('/api/indeed', async (req, res) => {
  try {
    // Get parameters from query string
    const {
      location,
      radius = 25,
      query = '',
      limit = 100
    } = req.query;
    
    // Validate required parameters
    if (!location) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'The location parameter is required'
      });
    }
    
    console.log(`Searching Indeed for: "${query}" in ${location} within ${radius} miles`);
    
    // Search for jobs with the given parameters
    const results = await jobSearch.searchIndeed({
      query,
      location,
      radius: parseInt(radius, 10),
      limit: parseInt(limit, 10)
    });
    
    // Generate a report with analytics if we have results
    if (results.jobs.length > 0) {
      const report = jobSearch.generateReport(results.jobs);
      
      // Add report data to the results
      results.stats = {
        topCompanies: report.topCompanies,
        locationDistribution: report.locationDistribution,
        salaryInfo: {
          count: report.salaryStats.count,
          percentage: report.salaryStats.percentage
        }
      };
    }
    
    // Return the results
    res.json(results);
  } catch (error) {
    console.error('Error processing Indeed request:', error);
    res.status(500).json({
      success: false,
      error: 'indeed_error',
      message: error.message
    });
  }
});

/**
 * Parse jobs from URL
 * POST /api/parse/url
 * Body: { "url": "https://www.usajobs.gov/Search/Results?k=software" }
 */
app.post('/api/parse/url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'URL is required in the request body'
      });
    }
    
    console.log(`Parsing jobs from URL: ${url}`);
    
    // Determine provider from URL
    let provider = 'unknown';
    if (url.includes('usajobs.gov')) {
      provider = 'usajobs';
    } else if (url.includes('indeed.com')) {
      provider = 'indeed';
    }
    
    // Parse jobs from the URL
    const jobs = await jobSearch.parseJobsFromURL(url);
    
    // Generate a report if we have results
    let stats = {};
    if (jobs.length > 0) {
      const report = jobSearch.generateReport(jobs);
      stats = {
        topCompanies: report.topCompanies,
        locationDistribution: report.locationDistribution,
        salaryInfo: {
          count: report.salaryStats.count,
          percentage: report.salaryStats.percentage
        }
      };
    }
    
    res.json({
      success: true,
      meta: {
        url,
        provider,
        count: jobs.length
      },
      stats,
      jobs
    });
  } catch (error) {
    console.error('Error parsing URL:', error);
    res.status(500).json({
      success: false,
      error: 'url_parse_error',
      message: error.message
    });
  }
});

/**
 * Denver healthcare jobs example
 * GET /api/examples/denver-healthcare
 */
app.get('/api/examples/denver-healthcare', async (req, res) => {
  try {
    console.log('Running Denver healthcare example search with failover...');
    
    // Search for healthcare jobs in Denver with failover enabled
    const results = await jobSearch.searchJobs({
      query: 'healthcare',
      location: 'Denver, CO',
      radius: 25
    }, {
      verbose: false,
      alwaysMergeResults: true // Use both providers for comprehensive results
    });
    
    // Return the results
    res.json(results);
  } catch (error) {
    console.error('Error running example:', error);
    res.status(500).json({
      success: false,
      error: 'example_error',
      message: error.message
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'server_error',
    message: 'An unexpected error occurred'
  });
});

/**
 * Start the server if this file is run directly
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Job Search API server running on port ${PORT}`);
    console.log(`API info: http://localhost:${PORT}/api`);
    console.log(`Example: http://localhost:${PORT}/api/jobs?location=Denver,%20CO&radius=25&query=healthcare`);
  });
}

// Export for testing
module.exports = app;