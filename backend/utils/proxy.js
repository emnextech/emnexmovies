/**
 * Proxy Utility Functions
 * Handles requests to Moviebox API with retry logic and error handling
 */

const axios = require('axios');
const { HOST_URL, MIRROR_HOSTS, SELECTED_HOST } = require('../config/constants');
const { getDefaultHeaders } = require('./headers');

// Track if cookies have been initialized
let cookiesInitialized = false;
let globalCookies = null;

/**
 * Get cookies from environment variable or initialize dynamically
 * Priority: MB_COOKIES env var > dynamic fetching
 * @returns {Promise<string|null>} Cookie string or null if failed
 */
async function ensureCookiesAreAssigned() {
  // If already initialized, return existing cookies
  if (cookiesInitialized && globalCookies) {
    return globalCookies;
  }

  // Check for MB_COOKIES environment variable first (Railway)
  const mbCookies = process.env.MB_COOKIES;
  if (mbCookies && mbCookies.trim()) {
    globalCookies = mbCookies.trim();
    cookiesInitialized = true;
    console.log('Using cookies from MB_COOKIES environment variable');
    console.log('Cookies preview:', globalCookies.substring(0, 100) + '...');
    console.log('Cookies full length:', globalCookies.length);
    console.log('Cookies contains i18n_lang:', globalCookies.includes('i18n_lang'));
    console.log('Cookies contains account:', globalCookies.includes('account'));
    return globalCookies;
  }

  // Fallback to dynamic cookie fetching if MB_COOKIES not set
  try {
    console.log('MB_COOKIES not set, initializing cookies from MovieBox app info endpoint...');
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
      console.log('Cookies initialized successfully from app info endpoint:', cookies.substring(0, 50) + '...');
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
 * Merge cookies from response with existing cookies
 * Combines account and i18n_lang cookies properly
 * @param {string} existingCookies - Existing cookie string
 * @param {string} newCookies - New cookies from response
 * @returns {string} Merged cookie string
 */
function mergeCookies(existingCookies, newCookies) {
  if (!existingCookies && !newCookies) return null;
  if (!existingCookies) return newCookies;
  if (!newCookies) return existingCookies;

  // Parse cookies into objects
  const parseCookies = (cookieStr) => {
    const cookies = {};
    cookieStr.split(';').forEach(cookie => {
      const trimmed = cookie.trim();
      if (!trimmed) return;
      const [name, ...valueParts] = trimmed.split('=');
      if (name) {
        cookies[name] = valueParts.join('='); // Handle values with = in them
      }
    });
    return cookies;
  };

  const existing = parseCookies(existingCookies);
  const newCookiesObj = parseCookies(newCookies);

  // Merge: new cookies override existing ones, but keep all
  const merged = { ...existing, ...newCookiesObj };

  // Convert back to cookie string
  return Object.entries(merged)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
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
  const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL; // e.g., "http://your-alibaba-ip:3001" or "https://proxy.yourdomain.com"
  const PROXY_API_KEY = process.env.PROXY_API_KEY; // Your secret API key

  const {
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    retries = 2,
    skipCookieInit = false, // Allow skipping cookie init for the init request itself
  } = options;

  // Ensure cookies are initialized before making requests (unless this is the init request)
  // Check MB_COOKIES env var first, then fallback to dynamic fetching
  if (!skipCookieInit && !cookiesInitialized) {
    await ensureCookiesAreAssigned();
  }

  // If custom headers are provided (e.g., for download requests), use them directly
  // Otherwise, merge with default headers
  // This prevents default headers (like "accept: application/json") from conflicting
  // with custom headers (like "Accept: text/html...")
  let requestHeaders;
  if (Object.keys(headers).length > 0) {
    // Custom headers provided - use them directly (they should be complete)
    // Only add Host if not present (required for HTTP/1.1)
    requestHeaders = { ...headers };
    if (!requestHeaders['Host'] && !requestHeaders['host']) {
      const host = SELECTED_HOST.replace(/^https?:\/\//, '');
      requestHeaders['Host'] = host;
    }
  } else {
    // No custom headers - use defaults
    const defaultHeaders = getDefaultHeaders();
    requestHeaders = { ...defaultHeaders };
  }
  
  // Add cookies to request headers if available (from MB_COOKIES or dynamic fetching)
  // Only add if not already present in custom headers
  if (globalCookies && !requestHeaders['Cookie'] && !requestHeaders['cookie']) {
    requestHeaders['Cookie'] = globalCookies;
  }

  // Try primary host first, then fallback to mirrors
  const hosts = [HOST_URL, ...MIRROR_HOSTS.map(host => `https://${host}/`)];
  
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const baseUrl of hosts) {
      try {
        let url;
        let proxyHeaders = { ...requestHeaders };
        
        if (PROXY_SERVER_URL) {
          // Route through proxy server
          const targetEndpoint = endpoint.startsWith('http') 
            ? endpoint 
            : `${baseUrl}${endpoint.replace(/^\//, '')}`;
          
          // Build target URL with query parameters if they exist
          let targetUrl = targetEndpoint;
          if (params && Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
          }
          
          url = `${PROXY_SERVER_URL}?url=${encodeURIComponent(targetUrl)}`;
          
          // Add API key header if configured
          if (PROXY_API_KEY) {
            proxyHeaders['x-api-key'] = PROXY_API_KEY;
          }
          
          console.log('Routing through proxy:', url);
          console.log('Target URL being proxied:', targetUrl);
          console.log('Proxy headers:', {
            cookie: proxyHeaders['Cookie'] ? proxyHeaders['Cookie'].substring(0, 50) + '...' : 'none',
            referer: proxyHeaders['Referer'] || 'none',
            origin: proxyHeaders['Origin'] || 'none',
          });
        } else {
          // Direct connection
          url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.replace(/^\//, '')}`;
        }
        
        const config = {
          method,
          url,
          headers: proxyHeaders,
          timeout: 60000, // 60 seconds (increased for Vercel)
          // Enable cookie handling - axios will automatically handle Set-Cookie headers
          withCredentials: false, // We'll manually extract cookies
        };

        if (data) {
          config.data = data;
        }

        // Only add params if NOT using proxy (proxy already includes them in the url parameter)
        if (params && !PROXY_SERVER_URL) {
          config.params = params;
        }

        const response = await axios(config);
        
        // Extract cookies from Set-Cookie headers if present
        // Store them in response for later use in download requests
        // Also update global cookies if new ones are received
        if (response.headers['set-cookie']) {
          // Convert Set-Cookie array to cookie string format
          const newCookies = response.headers['set-cookie']
            .map(cookie => {
              // Extract cookie name and value (before first semicolon)
              const cookiePart = cookie.split(';')[0].trim();
              return cookiePart;
            })
            .join('; ');
          
          // Merge with existing cookies (important: don't lose account cookie if i18n_lang is added)
          const mergedCookies = mergeCookies(globalCookies, newCookies);
          
          // Update global cookies if we got new ones
          if (mergedCookies) {
            globalCookies = mergedCookies;
            cookiesInitialized = true;
          }
          
          // Attach merged cookies to response object for easy access
          response.cookies = mergedCookies || globalCookies;
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
  mergeCookies,
};

