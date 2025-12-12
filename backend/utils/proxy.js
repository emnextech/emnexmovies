/**
 * Proxy Utility Functions
 * Handles requests to Moviebox API with retry logic and error handling
 */

const axios = require('axios');
const { HOST_URL, MIRROR_HOSTS } = require('../config/constants');
const { getDefaultHeaders } = require('./headers');

// Track if cookies have been initialized
let cookiesInitialized = false;
let globalCookies = null;

/**
 * Initialize cookies by calling the MovieBox app info endpoint
 * This must be called before making API requests to get the account cookie
 * @returns {Promise<string|null>} Cookie string or null if failed
 */
async function ensureCookiesAreAssigned() {
  // If already initialized, return existing cookies
  if (cookiesInitialized && globalCookies) {
    return globalCookies;
  }

  try {
    console.log('Initializing cookies from MovieBox app info endpoint...');
    const headers = getDefaultHeaders();
    const url = `${HOST_URL}wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox`;
    
    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      timeout: 30000,
    });

    // Extract cookies from Set-Cookie headers
    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie']
        .map(cookie => {
          // Extract cookie name and value (before first semicolon)
          const cookiePart = cookie.split(';')[0].trim();
          return cookiePart;
        })
        .join('; ');
      
      globalCookies = cookies;
      cookiesInitialized = true;
      console.log('Cookies initialized successfully:', cookies.substring(0, 50) + '...');
      return cookies;
    } else {
      console.warn('No cookies received from app info endpoint');
      cookiesInitialized = true; // Mark as initialized even if no cookies to avoid retrying
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize cookies:', error.message);
    cookiesInitialized = true; // Mark as initialized to avoid infinite retries
    return null;
  }
}

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
    skipCookieInit = false, // Allow skipping cookie init for the init request itself
  } = options;

  // Ensure cookies are initialized before making requests (unless this is the init request)
  if (!skipCookieInit && !cookiesInitialized) {
    await ensureCookiesAreAssigned();
  }

  const defaultHeaders = getDefaultHeaders();
  const requestHeaders = { ...defaultHeaders, ...headers };
  
  // Add cookies to request headers if available
  if (globalCookies) {
    requestHeaders['Cookie'] = globalCookies;
  }

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
          // Enable cookie handling - axios will automatically handle Set-Cookie headers
          withCredentials: false, // We'll manually extract cookies
        };

        if (data) {
          config.data = data;
        }

        if (params) {
          config.params = params;
        }

        const response = await axios(config);
        
        // Extract cookies from Set-Cookie headers if present
        // Store them in response for later use in download requests
        // Also update global cookies if new ones are received
        if (response.headers['set-cookie']) {
          // Convert Set-Cookie array to cookie string format
          const cookies = response.headers['set-cookie']
            .map(cookie => {
              // Extract cookie name and value (before first semicolon)
              const cookiePart = cookie.split(';')[0].trim();
              return cookiePart;
            })
            .join('; ');
          
          // Update global cookies if we got new ones
          if (cookies) {
            globalCookies = cookies;
            cookiesInitialized = true;
          }
          
          // Attach cookies to response object for easy access
          response.cookies = cookies;
        } else if (globalCookies) {
          // If no new cookies but we have global cookies, use those
          response.cookies = globalCookies;
        }
        
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
  ensureCookiesAreAssigned,
};

