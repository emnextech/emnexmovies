/**
 * Frontend Configuration
 * Handles API base URL configuration for different environments
 */

(function() {
  'use strict';

  /**
   * Get API base URL from various sources
   * Priority:
   * 1. window.API_BASE_URL (set via script tag in HTML)
   * 2. Environment variable (for build-time injection)
   * 3. Relative URLs (development fallback)
   */
  function getApiBaseUrl() {
    // Check for global variable (set in HTML)
    if (typeof window !== 'undefined' && window.API_BASE_URL) {
      return window.API_BASE_URL;
    }

    // Check for environment variable (injected at build time)
    // This works with Vercel environment variables
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
      return process.env.VITE_API_BASE_URL;
    }

    // For development: use relative URLs (same origin)
    // This allows local development without backend URL
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '';

    if (isDevelopment) {
      // Return empty string for relative URLs
      return '';
    }

    // Production fallback: try to detect if we're on Vercel
    // If no API_BASE_URL is set, assume relative URLs (same origin)
    // This will work if frontend and backend are on same domain
    return '';
  }

  /**
   * Configuration object
   */
  const config = {
    /**
     * API base URL
     * Empty string means relative URLs (same origin)
     * Set to full URL (e.g., 'https://api.example.com') for cross-origin
     */
    API_BASE_URL: getApiBaseUrl(),

    /**
     * Check if using absolute URLs (cross-origin)
     */
    isAbsoluteUrl: function() {
      return this.API_BASE_URL !== '' && this.API_BASE_URL.startsWith('http');
    },

    /**
     * Build full API URL from endpoint
     * @param {string} endpoint - API endpoint path
     * @returns {string} Full URL or relative path
     */
    buildApiUrl: function(endpoint) {
      if (!endpoint) return this.API_BASE_URL;
      
      // Ensure endpoint starts with /
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // If API_BASE_URL is empty, return relative path
      if (!this.API_BASE_URL) {
        return path;
      }

      // Remove trailing slash from base URL
      const base = this.API_BASE_URL.replace(/\/$/, '');
      
      return `${base}${path}`;
    },
  };

  // Make config available globally
  if (typeof window !== 'undefined') {
    window.appConfig = config;
  }

  // Export for modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
  }

  // Log configuration in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('API Configuration:', {
      API_BASE_URL: config.API_BASE_URL || '(relative URLs)',
      isAbsolute: config.isAbsoluteUrl(),
    });
  }
})();

