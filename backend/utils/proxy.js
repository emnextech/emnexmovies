/**
 * Proxy Utility Functions
 * Handles requests to Moviebox API with retry logic and error handling
 */

const axios = require('axios');
const { HOST_URL, MIRROR_HOSTS } = require('../config/constants');
const { getDefaultHeaders } = require('./headers');

/**
 * Make a request to the Moviebox API with retry logic
 * @param {string} endpoint - API endpoint (relative path)
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.data - Request body for POST requests
 * @param {Object} options.params - Query parameters
 * @param {Object} options.headers - Additional headers
 * @param {number} options.retries - Number of retry attempts (default: 2)
 * @returns {Promise} Axios response
 */
async function makeRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    retries = 2,
  } = options;

  const defaultHeaders = getDefaultHeaders();
  const requestHeaders = { ...defaultHeaders, ...headers };

  // Try primary host first, then fallback to mirrors
  const hosts = [HOST_URL, ...MIRROR_HOSTS.map(host => `https://${host}/`)];
  
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const baseUrl of hosts) {
      try {
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.replace(/^\//, '')}`;
        
        const config = {
          method,
          url,
          headers: requestHeaders,
          timeout: 60000, // 60 seconds (increased for Vercel)
        };

        if (data) {
          config.data = data;
        }

        if (params) {
          config.params = params;
        }

        const response = await axios(config);
        return response;
      } catch (error) {
        lastError = error;
        // If it's a 404 or 403, don't retry with other hosts
        if (error.response && [404, 403].includes(error.response.status)) {
          throw error;
        }
        // Continue to next host
        continue;
      }
    }
    
    // If all hosts failed, wait before retry
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

module.exports = {
  makeRequest,
};

