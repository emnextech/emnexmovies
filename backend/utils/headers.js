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
    "accept-language": "en-US,en;q=0.5",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "referer": referer || HOST_URL,
    "Host": host,
    "X-client-info": '{"timezone":"Africa/Nairobi"}',
  };
}

/**
 * Get headers for download requests (HTML response)
 * These headers MUST exactly match what a real browser sends, otherwise the API blocks the request.
 * 
 * Required headers:
 * - Accept: text/html,application/xhtml+xml,application/xml;q=0.9 with wildcard (NOT application/json)
 * - User-Agent: Real browser user-agent (Firefox on Linux)
 * - Referer: https://h5.aoneroom.com/movies/[detailPath] (MUST match the movie detail page)
 * - Origin: https://h5.aoneroom.com (MUST be present)
 * - Connection: keep-alive (browser-like behavior)
 * - Host: h5.aoneroom.com
 * - Cookie: account and i18n_lang cookies (if available)
 * 
 * @param {string} detailPath - Detail path for the movie/TV series, e.g. "alex-rider-anDQo2BS6A9"
 * @param {string} cookies - Optional cookies string
 * @returns {Object} Headers object
 */
function getDownloadHeaders(detailPath = null, cookies = null) {
  const host = SELECTED_HOST.replace(/^https?:\/\//, '');
  const origin = SELECTED_HOST.replace(/\/$/, ''); // Remove trailing slash if present
  
  // Referer MUST be exactly: https://h5.aoneroom.com/movies/<detailPath>
  // This is the MOST critical header - API checks if request comes from the movie detail page
  const referer = detailPath 
    ? `${origin}/movies/${detailPath.replace(/^\//, '')}` 
    : `${origin}/`;
  
  const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "Referer": referer,
    "Origin": origin,
    "Host": host,
    "Connection": "keep-alive",
    "X-client-info": '{"timezone":"Africa/Nairobi"}',
  };
  
  // Add cookies if provided (from MB_COOKIES env var or dynamic fetching)
  // Cookies are required for the API to return download links
  if (cookies) {
    headers["Cookie"] = cookies;
  }
  
  return headers;
}

/**
 * Get headers for media file downloads (video/subtitle files)
 * MovieBox requires strict headers for actual file downloads (not metadata)
 * 
 * Required headers include:
 * - Accept header with wildcard value
 * - User-Agent: Firefox Linux user agent string
 * - Origin: MovieBox host URL
 * - Referer: Must be exactly fmoviesunblocked.net
 * - Range: Byte range for resumable downloads
 * - accept-language: Language preferences
 * - Cookie: account and i18n_lang cookies from metadata page
 * 
 * @param {string} downloadUrl - Optional download URL
 * @param {string} cookies - Optional cookies string from metadata request
 * @param {string} range - Optional Range header value
 * @returns {Object} Headers object
 */
function getMediaDownloadHeaders(downloadUrl = null, cookies = null, range = "bytes=0-") {
  // Origin should be the full selected host URL (e.g., https://h5.aoneroom.com)
  const origin = SELECTED_HOST.replace(/\/$/, ''); // Remove trailing slash if present
  // Referer MUST be exactly https://fmoviesunblocked.net/ - MovieBox blocks other referers
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

