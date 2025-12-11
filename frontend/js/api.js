/**
 * API Client
 * Handles all API requests to the backend
 * Requires config.js to be loaded first
 */

/**
 * Get API configuration
 * @returns {Object} Config object with buildApiUrl method
 */
function getConfig() {
  if (typeof window !== 'undefined' && window.appConfig) {
    return window.appConfig;
  }
  // Fallback if config not loaded
  return {
    buildApiUrl: (endpoint) => {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return path;
    },
  };
}

/**
 * Make API request
 * @param {string} endpoint - API endpoint (full path from guide)
 * @param {Object} options - Request options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', data = null, params = null } = options;
  const config = getConfig();

  const requestConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Build full URL using config
  let url = config.buildApiUrl(endpoint);

  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  if (data && method !== 'GET') {
    requestConfig.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      const apiError = new Error(error.message || error.error || 'Request failed');
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      throw apiError;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    // If error doesn't have status, it's likely a network error
    if (!error.status) {
      error.status = 0;
    }
    throw error;
  }
}

/**
 * Fetch homepage content
 * @returns {Promise} Homepage data
 */
async function home() {
  return apiRequest('/wefeed-h5-bff/web/home');
}

/**
 * Search for movies/TV series
 * @param {string} keyword - Search keyword
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @returns {Promise} Search results
 */
async function search(keyword, filters = {}, page = 1) {
  const { subjectType = 0, perPage = 24 } = filters;
  
  try {
    const response = await apiRequest('/wefeed-h5-bff/web/subject/search', {
      method: 'POST',
      data: {
        keyword,
        page,
        perPage,
        subjectType,
      },
    });
    // Handle both nested data structure and direct response
    return response.data || response;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Get search suggestions/autocomplete
 * @param {string} keyword - Partial keyword
 * @returns {Promise} Suggestions
 */
async function searchSuggest(keyword) {
  if (!keyword || keyword.length < 2) {
    return { items: [] };
  }

  try {
    const response = await apiRequest('/wefeed-h5-bff/web/subject/search-suggest', {
      method: 'POST',
      data: {
        keyword,
        per_page: 10,
      },
    });
    // Handle both nested data structure and direct response
    return response.data || response;
  } catch (error) {
    console.error('Search suggest error:', error);
    return { items: [] };
  }
}

/**
 * Get trending content
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise} Trending content
 */
async function trending(page = 0, perPage = 18) {
  return apiRequest('/wefeed-h5-bff/web/subject/trending', {
    params: { page, perPage },
  });
}

/**
 * Get popular searches
 * @returns {Promise} Popular searches
 */
async function popularSearches() {
  try {
    const response = await apiRequest('/wefeed-h5-bff/web/subject/everyone-search');
    // Handle both nested data structure and direct response
    return response.data || response;
  } catch (error) {
    console.error('Popular searches error:', error);
    return { everyoneSearch: [] };
  }
}

/**
 * Get hot content rankings
 * @returns {Promise} Hot content
 */
async function hotContent() {
  return apiRequest('/wefeed-h5-bff/web/subject/search-rank');
}

/**
 * Get movie/TV series details
 * Note: This endpoint returns HTML, backend parses it
 * @param {string} subjectId - Movie/TV series ID
 * @param {string} detailPath - Detail path from search result
 * @returns {Promise} Movie details
 */
async function getMovieDetails(subjectId, detailPath) {
  // Use /api/movie for backward compatibility (this endpoint parses HTML)
  return apiRequest(`/api/movie/${subjectId}`, {
    params: { detailPath },
  });
}

/**
 * Get download metadata (video URLs, subtitles)
 * @param {string} subjectId - Movie/TV series ID
 * @param {string} detailPath - Detail path
 * @param {number} season - Season number (0 for movies)
 * @param {number} episode - Episode number (0 for movies)
 * @returns {Promise} Download metadata with downloads and captions arrays
 */
async function getDownloadMetadata(subjectId, detailPath, season = 0, episode = 0) {
  // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
  if (episode === 0 || parseInt(episode) === 0) {
    season = 0;
  }
  
  const response = await apiRequest('/wefeed-h5-bff/web/subject/download', {
    params: {
      subjectId,
      detailPath,
      se: season,
      ep: episode,
    },
  });
  
  // Handle response structure - may have nested data or be direct
  const responseData = response.data || response;
  const data = responseData.data || responseData;
  
  // Debug logging
  console.log('Download metadata response structure:', {
    hasResponseData: !!responseData,
    hasData: !!data,
    downloadsCount: data?.downloads?.length || 0,
    firstDownload: data?.downloads?.[0] || null,
  });
  
  // Ensure downloads and captions arrays exist with size information
  const downloads = (data.downloads || []).map(download => {
    // Ensure size is preserved as string (API returns it as string)
    const size = download.size || download.fileSize || null;
    return {
      id: download.id,
      url: download.url,
      resolution: download.resolution,
      size: size, // File size in bytes (as string from API, e.g., "623914683")
    };
  });
  
  const captions = (data.captions || []).map(caption => ({
    id: caption.id,
    url: caption.url,
    lan: caption.lan,
    lanName: caption.lanName,
    size: caption.size || caption.fileSize || null, // File size in bytes (as string from API)
    delay: caption.delay || 0,
  }));
  
  console.log('Processed downloads:', downloads.map(d => ({ 
    resolution: d.resolution, 
    hasSize: !!d.size, 
    size: d.size 
  })));
  
  return {
    downloads: downloads,
    captions: captions,
    limited: data.limited || false,
    limitedCode: data.limitedCode || '',
    freeNum: data.freeNum || 0,
    hasResource: data.hasResource || false,
  };
}

/**
 * Get streaming metadata (video URLs for streaming)
 * @param {string} subjectId - Movie/TV series ID
 * @param {string} detailPath - Detail path
 * @param {number} season - Season number (0 for movies)
 * @param {number} episode - Episode number (0 for movies)
 * @returns {Promise} Streaming metadata
 */
async function getPlayMetadata(subjectId, detailPath, season = 0, episode = 0) {
  // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
  if (episode === 0 || parseInt(episode) === 0) {
    season = 0;
  }
  
  return apiRequest('/wefeed-h5-bff/web/subject/play', {
    params: {
      subjectId,
      detailPath,
      se: season,
      ep: episode,
    },
  });
}

/**
 * Get recommendations
 * @param {string} subjectId - Movie/TV series ID
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise} Recommendations
 */
async function getRecommendations(subjectId, page = 1, perPage = 24) {
  return apiRequest('/wefeed-h5-bff/web/subject/detail-rec', {
    params: { subjectId, page, perPage },
  });
}

/**
 * Download file with progress tracking
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 * @param {Function} onProgress - Progress callback (progress, loaded, total)
 * @returns {Promise} Download result
 */
function download(url, filename, onProgress = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const config = getConfig();
    
    // Build download URL using config
    const downloadUrl = config.buildApiUrl(`/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`);

    xhr.open('GET', downloadUrl, true);
    xhr.responseType = 'blob';

    // Track progress
    if (onProgress) {
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress, e.loaded, e.total);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        // Create download link
        const blob = xhr.response;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        resolve({ success: true, filename });
      } else {
        reject(new Error(`Download failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Download failed: Network error'));
    };

    xhr.send();
  });
}

/**
 * Download subtitle file
 * @param {string} url - Subtitle URL
 * @param {string} filename - Download filename
 * @returns {Promise} Download result
 */
function downloadSubtitle(url, filename) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const config = getConfig();
    const downloadUrl = config.buildApiUrl(`/api/download-subtitle?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`);

    xhr.open('GET', downloadUrl, true);
    xhr.responseType = 'blob';

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        resolve({ success: true, filename });
      } else {
        reject(new Error(`Subtitle download failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Subtitle download failed: Network error'));
    };

    xhr.send();
  });
}

// Export API object
const api = {
  home,
  search,
  searchSuggest,
  trending,
  popularSearches,
  hotContent,
  getMovieDetails,
  getDownloadMetadata,
  getPlayMetadata,
  getRecommendations,
  download,
  downloadSubtitle,
};

// Make available globally
if (typeof window !== 'undefined') {
  window.api = api;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

