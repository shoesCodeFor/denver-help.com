/**
 * Job Provider Manager
 * 
 * This module manages job search providers with failover capability.
 * It prioritizes USAJobs as the primary source and falls back to
 * Indeed scraping when necessary.
 */
const usaJobs = require('./usajobs');
const indeed = require('./indeed');

// Default configuration
const DEFAULT_CONFIG = {
  // Minimum number of results before triggering failover
  minResultsThreshold: 5,
  
  // Whether to merge results from all sources or use only primary when sufficient
  alwaysMergeResults: false,
  
  // Maximum number of results to return
  maxResults: 100,
  
  // Logging
  verbose: false,
  
  // Whether to throw errors (true) or return empty results (false)
  throwErrors: false
};

/**
 * Search for jobs across providers with failover logic
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job search keywords
 * @param {string} params.location - Location (city, state, zip)
 * @param {number} params.radius - Search radius in miles
 * @param {Object} options - Additional options
 * @param {string} options.primaryProvider - Override the primary provider (default: 'usajobs')
 * @param {number} options.minResultsThreshold - Minimum results before failover
 * @param {boolean} options.alwaysMergeResults - Always use results from all providers
 * @param {boolean} options.skipFailover - Skip failover logic, use only primary
 * @returns {Promise<Object>} - Promise resolving to search results object
 */
async function searchJobs(params, options = {}) {
  // Merge default config with provided options
  const config = {
    ...DEFAULT_CONFIG,
    ...options
  };
  
  // Determine primary provider
  const primaryProvider = options.primaryProvider || 'usajobs';
  
  // Log search parameters if verbose
  if (config.verbose) {
    console.log(`Job search: ${params.query} in ${params.location} (${params.radius} miles)`);
    console.log(`Primary provider: ${primaryProvider}`);
  }
  
  // Track sources used
  const sourcesUsed = [];
  let allJobs = [];
  let primaryResults = [];
  let secondaryResults = [];
  let errors = [];
  
  try {
    // 1. Try the primary provider first
    if (primaryProvider === 'usajobs') {
      // Map general parameters to USAJobs specific format
      const usaJobsParams = {
        keyword: params.query,
        locationName: params.location,
        radius: params.radius,
        resultsPerPage: config.maxResults
      };
      
      try {
        // Call USAJobs API
        const response = await usaJobs.searchJobs(usaJobsParams, config);
        primaryResults = usaJobs.mapToStandardFormat(response);
        
        if (config.verbose) {
          console.log(`USAJobs returned ${primaryResults.length} results`);
        }
        
        sourcesUsed.push('usajobs');
        allJobs.push(...primaryResults);
      } catch (error) {
        errors.push({ provider: 'usajobs', error: error.message });
        if (config.verbose) {
          console.error(`USAJobs search failed: ${error.message}`);
        }
      }
    } else {
      // Use Indeed as primary
      try {
        primaryResults = await indeed.searchJobs(params, config);
        
        if (config.verbose) {
          console.log(`Indeed returned ${primaryResults.length} results`);
        }
        
        sourcesUsed.push('indeed');
        allJobs.push(...primaryResults);
      } catch (error) {
        errors.push({ provider: 'indeed', error: error.message });
        if (config.verbose) {
          console.error(`Indeed search failed: ${error.message}`);
        }
      }
    }
    
    // 2. Determine if we need to use failover
    const needsFailover = 
      !config.skipFailover && 
      (primaryResults.length < config.minResultsThreshold || 
       config.alwaysMergeResults);
    
    // 3. Use failover if needed
    if (needsFailover) {
      if (config.verbose) {
        console.log(`Using failover: primary returned ${primaryResults.length} results (threshold: ${config.minResultsThreshold})`);
      }
      
      // Determine which provider to use for failover
      if (primaryProvider === 'usajobs') {
        try {
          // Use Indeed as failover
          secondaryResults = await indeed.searchJobs(params, config);
          
          if (config.verbose) {
            console.log(`Indeed failover returned ${secondaryResults.length} results`);
          }
          
          sourcesUsed.push('indeed');
          allJobs.push(...secondaryResults);
        } catch (error) {
          errors.push({ provider: 'indeed', error: error.message });
          if (config.verbose) {
            console.error(`Indeed failover failed: ${error.message}`);
          }
        }
      } else {
        // Use USAJobs as failover
        try {
          const usaJobsParams = {
            keyword: params.query,
            locationName: params.location,
            radius: params.radius,
            resultsPerPage: config.maxResults
          };
          
          const response = await usaJobs.searchJobs(usaJobsParams, config);
          secondaryResults = usaJobs.mapToStandardFormat(response);
          
          if (config.verbose) {
            console.log(`USAJobs failover returned ${secondaryResults.length} results`);
          }
          
          sourcesUsed.push('usajobs');
          allJobs.push(...secondaryResults);
        } catch (error) {
          errors.push({ provider: 'usajobs', error: error.message });
          if (config.verbose) {
            console.error(`USAJobs failover failed: ${error.message}`);
          }
        }
      }
    }
    
    // 4. Deduplicate jobs by ID (if merging results)
    if (sourcesUsed.length > 1) {
      const jobMap = new Map();
      
      for (const job of allJobs) {
        // Use ID as unique key, or URL if ID not available
        const key = job.id || job.url;
        if (key && !jobMap.has(key)) {
          jobMap.set(key, job);
        }
      }
      
      allJobs = Array.from(jobMap.values());
      
      if (config.verbose) {
        console.log(`After deduplication: ${allJobs.length} unique jobs`);
      }
    }
    
    // 5. Apply limit if specified
    if (config.maxResults && allJobs.length > config.maxResults) {
      allJobs = allJobs.slice(0, config.maxResults);
    }
    
    // 6. Return results
    return {
      success: allJobs.length > 0,
      meta: {
        sources: sourcesUsed,
        primaryProvider,
        primaryCount: primaryResults.length,
        secondaryCount: secondaryResults.length,
        totalCount: allJobs.length,
        errors: errors.length > 0 ? errors : undefined
      },
      jobs: allJobs
    };
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in job search:', error);
    
    if (config.throwErrors) {
      throw error;
    }
    
    return {
      success: false,
      meta: {
        sources: sourcesUsed,
        error: error.message
      },
      jobs: []
    };
  }
}

module.exports = {
  searchJobs,
  providers: {
    usajobs: usaJobs,
    indeed: indeed
  }
};