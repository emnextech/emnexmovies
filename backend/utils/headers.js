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
 * Get headers for download requests (HTML response)
 * @param {string} detailPath - Detail path for the movie/TV series
 * @returns {Object} Headers object
 */
function getDownloadHeaders(detailPath = null) {
  const host = SELECTED_HOST.replace(/^https?:\/\//, '');
  const referer = detailPath ? `${HOST_URL}movies/${detailPath}` : HOST_URL;
  
  return {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US, en;q=0.5",
    "user-agent": "mozilla/5.0aoneroom.com/",
    "referer": referer,
    "Host": host,
    "X-client-info": '{"timezone":"Africa/Nairobi"}',
  };
}

/**
 * Get headers for media file downloads (video/subtitle files)
 * Based on src/moviebox_api/constants.py DOWNLOAD_REQUEST_HEADERS
 * According to user requirements:
 * - Accept: * / *
 * - User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0
 * - Origin: [The selected Moviebox host, e.g., https://h5.aoneroom.com]
 * - Referer: https://fmoviesunblocked.net/
 * @param {string} downloadUrl - Optional download URL (for referer fallback)
 * @returns {Object} Headers object
 */
function getMediaDownloadHeaders(downloadUrl = null) {
  // Origin should be the full selected host URL (e.g., https://h5.aoneroom.com)
  const origin = SELECTED_HOST.replace(/\/$/, ''); // Remove trailing slash if present
  // Referer should always be https://fmoviesunblocked.net/ for media downloads
  const referer = DOWNLOAD_REQUEST_REFERER;
  
  return {
    "Accept": "*/*",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "Origin": origin,
    "Referer": referer,
  };
}

module.exports = {
  getDefaultHeaders,
  getDownloadHeaders,
  getMediaDownloadHeaders,
  DOWNLOAD_REQUEST_REFERER,
};

