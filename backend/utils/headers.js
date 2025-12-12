/**
 * Header Configuration Utilities
 * Based on src/moviebox_api/constants.py
 */

const { HOST_URL, SELECTED_HOST } = require('../config/constants');

const DOWNLOAD_REQUEST_REFERER = "https://fmoviesunblocked.net/";

/**
 * Get default headers for API requests
 * @param {string} referer - Optional custom referer URL
 * @returns {Object} Headers object
 */
function getDefaultHeaders(referer = null) {
  const host = SELECTED_HOST.replace(/^https?:\/\//, '');
  
  return {
    "accept": "application/json",
    "accept-language": "en-US, en;q=0.5",
    "user-agent": "mozilla/5.0aoneroom.com/",
    "referer": referer || HOST_URL,
    "Host": host,
    "X-client-info": '{"timezone":"Africa/Nairobi"}',
  };
}

/**
 * Get headers for download metadata requests (HTML response)
 * Used for /wefeed-h5-bff/web/subject/download endpoint to get download URLs
 * 
 * CRITICAL: Referer must match the exact movie detail page URL format
 * Format: ${HOST_URL}movies/${detailPath}
 * Example: https://h5.aoneroom.com/movies/avatar-WLDIi21IUBa
 * 
 * Without the correct Referer, the API may return empty download data or invalid URLs.
 * 
 * @param {string} detailPath - Detail path for the movie/TV series (e.g., "avatar-WLDIi21IUBa")
 * @returns {Object} Headers object with correct Referer header
 */
function getDownloadHeaders(detailPath = null) {
  const host = SELECTED_HOST.replace(/^https?:\/\//, '');
  // Referer must be the exact movie detail page URL: ${HOST_URL}movies/${detailPath}
  // This is required by the API to return valid download metadata
  const referer = detailPath ? `${HOST_URL}movies/${detailPath}` : HOST_URL;
  
  return {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US, en;q=0.5",
    "user-agent": "mozilla/5.0aoneroom.com/",
    "referer": referer, // CRITICAL: Must match movie detail page URL
    "Host": host,
    "X-client-info": '{"timezone":"Africa/Nairobi"}',
  };
}

/**
 * Get headers for media file downloads (video/subtitle files)
 * MovieBox requires strict headers for actual file downloads (not metadata)
 * 
 * CRITICAL HEADER REQUIREMENTS:
 * - Accept: wildcard value (different from metadata requests)
 * - User-Agent: Firefox Linux user agent string
 * - Origin: MovieBox host URL (e.g., https://h5.aoneroom.com)
 * - Referer: MUST be exactly https://fmoviesunblocked.net/ - MovieBox blocks other referers
 * - Range: Byte range for resumable downloads (e.g., bytes=0-)
 * - accept-language: Language preferences
 * - Cookie: account and i18n_lang cookies from metadata page (REQUIRED for downloads)
 * 
 * NOTE: The Referer for media downloads is DIFFERENT from metadata requests:
 * - Metadata requests use: HOST_URL + movies/ + detailPath
 * - Media downloads use: https://fmoviesunblocked.net/
 * 
 * Without the correct Referer, the CDN will reject the download request.
 * 
 * @param {string} downloadUrl - Optional download URL (not currently used, reserved for future use)
 * @param {string} cookies - Optional cookies string from metadata request (REQUIRED for successful downloads)
 * @param {string} range - Optional Range header value for resumable downloads (default: "bytes=0-")
 * @returns {Object} Headers object with correct Referer and other required headers
 */
function getMediaDownloadHeaders(downloadUrl = null, cookies = null, range = "bytes=0-") {
  // Origin should be the full selected host URL (e.g., https://h5.aoneroom.com)
  const origin = SELECTED_HOST.replace(/\/$/, ''); // Remove trailing slash if present
  // CRITICAL: Referer MUST be exactly "https://fmoviesunblocked.net/" for media file downloads
  // This is different from metadata requests which use the movie detail page URL
  // MovieBox CDN will reject requests with incorrect Referer
  const referer = DOWNLOAD_REQUEST_REFERER;
  
  const headers = {
    "Accept": "*/*",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "Origin": origin,
    "Referer": referer,
    "Range": range,
    "accept-language": "en-US,en;q=0.5",
  };
  
  // Add cookies if provided (required for MovieBox downloads)
  if (cookies) {
    headers["Cookie"] = cookies;
  }
  
  return headers;
}

module.exports = {
  getDefaultHeaders,
  getDownloadHeaders,
  getMediaDownloadHeaders,
  DOWNLOAD_REQUEST_REFERER,
};

