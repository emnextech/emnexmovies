/**
 * API Proxy Routes
 * Proxies requests to Moviebox API endpoints
 */

const express = require('express');
const router = express.Router();
const { makeRequest } = require('../utils/proxy');
const { getDefaultHeaders, getDownloadHeaders, getMediaDownloadHeaders } = require('../utils/headers');
const { parseMovieDetailPage, parseDownloadableMetadata, fetchMovieDetailsFromHTML } = require('../utils/parser');
const { HOST_URL } = require('../config/constants');
const axios = require('axios');

/**
 * GET /wefeed-h5-bff/web/home
 * Fetches homepage content
 * Also available at /api/home for backward compatibility
 */
router.get('/wefeed-h5-bff/web/home', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/home', {
      method: 'GET',
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching homepage:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch homepage content',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/home', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/home', {
      method: 'GET',
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching homepage:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch homepage content',
      message: error.message,
    });
  }
});

/**
 * POST /wefeed-h5-bff/web/subject/search
 * Searches for movies/TV series
 * Also available at /api/search for backward compatibility
 */
router.post('/wefeed-h5-bff/web/subject/search', async (req, res) => {
  try {
    const { keyword, page = 1, perPage = 24, subjectType = 0 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await makeRequest('wefeed-h5-bff/web/subject/search', {
      method: 'POST',
      data: {
        keyword,
        page,
        perPage,
        subjectType,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

// Backward compatibility
router.post('/search', async (req, res) => {
  try {
    const { keyword, page = 1, perPage = 24, subjectType = 0 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await makeRequest('wefeed-h5-bff/web/subject/search', {
      method: 'POST',
      data: {
        keyword,
        page,
        perPage,
        subjectType,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * POST /wefeed-h5-bff/web/subject/search-suggest
 * Gets search suggestions/autocomplete
 * Also available at /api/search-suggest for backward compatibility
 */
router.post('/wefeed-h5-bff/web/subject/search-suggest', async (req, res) => {
  try {
    const { keyword, per_page = 10 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await makeRequest('wefeed-h5-bff/web/subject/search-suggest', {
      method: 'POST',
      data: {
        keyword,
        per_page,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting suggestions:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get suggestions',
      message: error.message,
    });
  }
});

// Backward compatibility
router.post('/search-suggest', async (req, res) => {
  try {
    const { keyword, per_page = 10 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await makeRequest('wefeed-h5-bff/web/subject/search-suggest', {
      method: 'POST',
      data: {
        keyword,
        per_page,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting suggestions:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get suggestions',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/trending
 * Gets trending content
 * Also available at /api/trending for backward compatibility
 */
router.get('/wefeed-h5-bff/web/subject/trending', async (req, res) => {
  try {
    const { page = 0, perPage = 18 } = req.query;

    const response = await makeRequest('wefeed-h5-bff/web/subject/trending', {
      method: 'GET',
      params: {
        page,
        perPage,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching trending:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch trending content',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/trending', async (req, res) => {
  try {
    const { page = 0, perPage = 18 } = req.query;

    const response = await makeRequest('wefeed-h5-bff/web/subject/trending', {
      method: 'GET',
      params: {
        page,
        perPage,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching trending:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch trending content',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/everyone-search
 * Gets popular search terms
 * Also available at /api/popular-searches for backward compatibility
 */
router.get('/wefeed-h5-bff/web/subject/everyone-search', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/subject/everyone-search', {
      method: 'GET',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching popular searches:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch popular searches',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/popular-searches', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/subject/everyone-search', {
      method: 'GET',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching popular searches:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch popular searches',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/search-rank
 * Gets hot/popular content rankings
 * Also available at /api/hot-content for backward compatibility
 */
router.get('/wefeed-h5-bff/web/subject/search-rank', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/subject/search-rank', {
      method: 'GET',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching hot content:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch hot content',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/hot-content', async (req, res) => {
  try {
    const response = await makeRequest('wefeed-h5-bff/web/subject/search-rank', {
      method: 'GET',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching hot content:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch hot content',
      message: error.message,
    });
  }
});

/**
 * GET /api/movie/:subjectId
 * Gets movie/TV series details by parsing HTML page
 * Extracts all metadata including resources, seasons, episodes, staff, etc.
 * 
 * This endpoint scrapes the HTML page and extracts JSON data embedded in script tags.
 * The endpoint URL format: /movies/{detailPath}?id={subjectId}
 * 
 * Query parameters:
 * - detailPath (required): Detail path from search result (e.g., "avatar-WLDIi21IUBa")
 * 
 * Example: GET /api/movie/8906247916759695608?detailPath=avatar-WLDIi21IUBa
 */
router.get('/movie/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { detailPath } = req.query;

    if (!detailPath) {
      return res.status(400).json({ error: 'detailPath query parameter is required' });
    }

    // Use the new scraping function that handles the complete flow
    const movieDetails = await fetchMovieDetailsFromHTML(detailPath, subjectId);

    res.json(movieDetails);
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch movie details',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/download
 * Gets download URLs for a movie/TV series episode
 * Query params: subjectId, se, ep, detailPath
 * 
 * Headers according to documentation:
 * - Accept: text/html,application/xhtml+xml,application/xml;q=0.9,* / *;q=0.8
 * - Referer: https://h5.aoneroom.com/movies/{detailPath}
 * 
 * Also available at /api/download-metadata/:subjectId for backward compatibility
 */
router.get('/wefeed-h5-bff/web/subject/download', async (req, res) => {
  try {
    let { subjectId, se = 0, ep = 0, detailPath } = req.query;

    // Convert to numbers and enforce movie rules
    const originalSe = se;
    const originalEp = ep;
    se = parseInt(se) || 0;
    ep = parseInt(ep) || 0;
    
    // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
    if (ep === 0) {
      se = 0;
    }
    
    console.log('Normalized params:', { 
      subjectId, 
      se, 
      ep, 
      detailPath, 
      originalSe, 
      originalEp,
      seChanged: originalSe !== se,
      epChanged: originalEp !== ep,
    });

    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId query parameter is required' });
    }

    if (!detailPath) {
      return res.status(400).json({ error: 'detailPath query parameter is required' });
    }

    // Use download headers with correct Accept header and referer
    // Referer should be the movie detail page URL
    // Get cookies (from MB_COOKIES env var or dynamic fetching) to include in headers
    const { ensureCookiesAreAssigned } = require('../utils/proxy');
    let requestCookies = await ensureCookiesAreAssigned();
    
    // Ensure i18n_lang cookie is present (API might require it for some movies)
    // If missing, add default value
    if (requestCookies && !requestCookies.includes('i18n_lang')) {
      requestCookies = requestCookies + '; i18n_lang=en';
      console.log('Added missing i18n_lang cookie to request');
    }
    
    const headers = getDownloadHeaders(detailPath, requestCookies);
    
    console.log('Fetching download metadata:', { subjectId, se, ep, detailPath });
    console.log('Using headers:', JSON.stringify(headers, null, 2));
    console.log('Has cookies:', !!requestCookies);

    const response = await makeRequest('wefeed-h5-bff/web/subject/download', {
      method: 'GET',
      params: {
        subjectId,
        se,
        ep,
      },
      headers,
    });

    // Response should have downloads and captions arrays
    // Ensure the structure matches the API documentation
    const responseData = response.data || {};
    
    // CRITICAL: Log the actual API response to see why downloads are empty
    console.log('=== FULL API RESPONSE DEBUG ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', {
      contentType: response.headers['content-type'],
      setCookie: response.headers['set-cookie'] ? 'present' : 'none',
    });
    console.log('response.data type:', typeof responseData);
    console.log('response.data structure:', {
      hasData: !!responseData.data,
      hasDownloads: !!responseData.downloads,
      dataHasDownloads: !!responseData.data?.downloads,
      dataKeys: responseData.data ? Object.keys(responseData.data) : [],
      rootKeys: Object.keys(responseData),
    });
    // Log first 1000 chars of response to see structure without overwhelming logs
    const responseDataString = JSON.stringify(responseData);
    console.log('responseData preview (first 1000 chars):', responseDataString.substring(0, 1000));
    if (responseDataString.length > 1000) {
      console.log('responseData total length:', responseDataString.length, 'chars');
    }
    console.log('=== END API RESPONSE DEBUG ===');
    
    // Extract cookies from response (required for actual file downloads)
    // MovieBox sets cookies like: account=...; i18n_lang=en
    // The response.cookies should already be merged (account + i18n_lang) from makeRequest
    // Use cookies from response if available, otherwise use request cookies
    const cookies = response.cookies || requestCookies || null;
    
    // Log cookie status for debugging
    if (cookies) {
      const hasI18n = cookies.includes('i18n_lang');
      const hasAccount = cookies.includes('account');
      if (!hasI18n || !hasAccount) {
        console.warn('Cookie warning:', {
          hasI18n,
          hasAccount,
          cookiePreview: cookies.substring(0, 100),
        });
      }
    }
    
    // Get downloads array for detailed logging
    // Try multiple possible locations for downloads array
    const allDownloads = responseData.data?.downloads || responseData.downloads || [];
    
    // Check if content is limited and log it
    const isLimited = responseData.data?.limited === true;
    if (isLimited) {
      console.warn('⚠️ CONTENT IS LIMITED:', {
        limited: responseData.data.limited,
        freeNum: responseData.data.freeNum,
        hasLimitedCode: !!responseData.data.limitedCode,
        limitedCodePreview: responseData.data.limitedCode ? responseData.data.limitedCode.substring(0, 50) + '...' : 'none',
        hasResource: responseData.data.hasResource,
        downloadsCount: allDownloads.length,
        message: `API is rate-limiting. ${responseData.data.freeNum > 0 ? `Free downloads remaining: ${responseData.data.freeNum}` : 'No free downloads remaining'}`,
      });
    }
    
    // If downloads are empty, log all possible locations
    if (allDownloads.length === 0) {
      console.warn('⚠️ NO DOWNLOADS FOUND - Checking all possible locations:');
      console.warn('  responseData.data?.downloads:', responseData.data?.downloads);
      console.warn('  responseData.downloads:', responseData.downloads);
      console.warn('  responseData.data keys:', responseData.data ? Object.keys(responseData.data) : 'no data');
      console.warn('  responseData root keys:', Object.keys(responseData));
      
      // Check if there's a different structure (e.g., code/data pattern)
      if (responseData.code !== undefined) {
        console.warn('  Response has code field:', responseData.code);
      }
      if (responseData.message) {
        console.warn('  Response message:', responseData.message);
      }
      if (responseData.data && typeof responseData.data === 'object') {
        console.warn('  responseData.data full structure:', JSON.stringify(responseData.data).substring(0, 500));
      }
    }
    
    // Log response structure with detailed information about resources
    console.log('=== DOWNLOAD METADATA RESPONSE ===');
    console.log('Download metadata response:', {
      hasData: !!responseData.data,
      downloadsCount: allDownloads.length,
      captionsCount: responseData.data?.captions?.length || responseData.captions?.length || 0,
      hasCookies: !!cookies,
      cookiesPreview: cookies ? cookies.substring(0, 100) + '...' : 'none',
      cookiesFull: cookies, // Log full cookies for debugging
      cookiesLength: cookies ? cookies.length : 0,
      hasI18nLang: cookies ? cookies.includes('i18n_lang') : false,
      hasAccount: cookies ? cookies.includes('account') : false,
    });
    
    // Log detailed information about each download including resource URLs
    if (allDownloads.length > 0) {
      console.log('Download items structure (before filtering):');
      allDownloads.forEach((download, index) => {
        const hasResource = !!download.resource;
        const hasResourceUrl = !!download.resource?.url;
        const hasDirectUrl = !!download.url;
        const resourceUrl = download.resource?.url || null;
        const directUrl = download.url || null;
        const resourceHasResource = download.resource?.hasResource; // Log the actual value
        
        console.log(`  Download ${index + 1}:`, {
          id: download.id,
          resolution: download.resolution,
          hasDirectUrl: hasDirectUrl,
          directUrlPreview: directUrl ? directUrl.substring(0, 80) + '...' : 'none',
          hasResource: hasResource,
          resourceHasResource: resourceHasResource, // Shows actual hasResource value from API
          hasResourceUrl: hasResourceUrl,
          resourceUrlPreview: resourceUrl ? resourceUrl.substring(0, 80) + '...' : 'none',
          resourceKeys: hasResource ? Object.keys(download.resource) : [],
        });
        
        // CRITICAL: Log which URL should be used (resource.url takes priority)
        const urlToUse = resourceUrl || directUrl;
        console.log(`  → URL TO USE FOR DOWNLOAD ${index + 1}: ${urlToUse ? urlToUse.substring(0, 100) + '...' : 'MISSING!'}`);
      });
    }
    
    // Filter downloads to only include entries with hasResource: true and valid URLs
    // MODIFIED: Allow downloads if they have a valid URL, even if hasResource is false
    // This handles cases where MovieBox blocks resource.hasResource but still provides download.url
    // Only filter out if BOTH hasResource is false AND no valid URL exists
    const downloads = allDownloads.filter((download) => {
      const hasResourceFlag = download.resource?.hasResource !== false;
      const hasResourceUrl = !!download.resource?.url;
      const hasDirectUrl = !!download.url;
      const hasValidUrl = hasResourceUrl || hasDirectUrl;
      
      // MODIFIED: Allow downloads if they have a valid URL, even if hasResource is false
      // This handles cases where MovieBox blocks resource.hasResource but still provides download.url
      // Only filter out if BOTH hasResource is false AND no valid URL exists
      const isValid = hasValidUrl && (hasResourceFlag || hasDirectUrl);
      
      if (!isValid) {
        console.log(`  ✗ Filtered out download ${download.id} (resolution: ${download.resolution}):`, {
          hasResourceFlag: hasResourceFlag,
          hasResourceUrl: hasResourceUrl,
          hasDirectUrl: hasDirectUrl,
          reason: !hasValidUrl ? 'no valid URL' : (!hasResourceFlag && !hasDirectUrl ? 'hasResource is false and no direct URL' : 'unknown'),
        });
      }
      
      return isValid;
    });
    
    console.log(`Filtered downloads: ${downloads.length} available out of ${allDownloads.length} total`);
    console.log('=== END METADATA RESPONSE ===');
    
    // Update response data with filtered downloads
    const finalResponseData = { ...responseData };
    if (finalResponseData.data) {
      finalResponseData.data.downloads = downloads;
      // Update hasResource flag based on filtered results
      finalResponseData.data.hasResource = downloads.length > 0;
    } else if (finalResponseData.downloads) {
      finalResponseData.downloads = downloads;
    }
    
    // Include cookies in response so frontend can pass them to download endpoint
    if (responseData.data) {
      // If response has nested data structure
      res.json({
        ...finalResponseData,
        _cookies: cookies, // Add cookies to response (frontend will use this)
      });
    } else if (responseData.downloads || responseData.captions) {
      // If response already has downloads/captions at root level
      res.json({
        code: 0,
        message: 'ok',
        data: finalResponseData,
        _cookies: cookies, // Add cookies to response (frontend will use this)
      });
    } else {
      // Empty response - return structure with empty arrays
      res.json({
        code: 0,
        message: 'ok',
        data: {
          downloads: [],
          captions: [],
          limited: false,
          limitedCode: '',
          freeNum: 0,
          hasResource: false,
        },
        _cookies: cookies, // Add cookies to response (frontend will use this)
      });
    }
  } catch (error) {
    console.error('Error fetching download metadata:', error.message);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
      message: error.message,
    });
    
    // Return more detailed error for debugging on Vercel
    const errorResponse = {
      error: 'Failed to fetch download metadata',
      message: error.message,
      details: error.response?.data || 'No additional details available',
    };
    
    // Include additional debugging info in development
    if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV) {
      errorResponse.debug = {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
      };
    }
    
    res.status(error.response?.status || 500).json(errorResponse);
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/play
 * Gets streaming URLs for a movie/TV series episode
 * Query params: subjectId, se, ep, detailPath
 */
router.get('/wefeed-h5-bff/web/subject/play', async (req, res) => {
  try {
    let { subjectId, se = 0, ep = 0, detailPath } = req.query;

    // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
    if (ep === 0 || parseInt(ep) === 0) {
      se = 0;
    }

    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId query parameter is required' });
    }

    if (!detailPath) {
      return res.status(400).json({ error: 'detailPath query parameter is required' });
    }

    const referer = `${HOST_URL}movies/${detailPath}`;
    const headers = getDefaultHeaders(referer);

    const response = await makeRequest('wefeed-h5-bff/web/subject/play', {
      method: 'GET',
      params: {
        subjectId,
        se,
        ep,
      },
      headers,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching play metadata:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch play metadata',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/download-metadata/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    let { se = 0, ep = 0, detailPath } = req.query;

    // Enforce: if episode is 0, season must be 0 (movies don't have seasons)
    if (ep === 0 || parseInt(ep) === 0) {
      se = 0;
    }

    if (!detailPath) {
      return res.status(400).json({ error: 'detailPath query parameter is required' });
    }

    // Use download headers with correct Accept header and referer
    const headers = getDownloadHeaders(detailPath);

    const response = await makeRequest('wefeed-h5-bff/web/subject/download', {
      method: 'GET',
      params: {
        subjectId,
        se,
        ep,
      },
      headers,
    });

    // Response should have downloads and captions arrays
    const responseData = response.data || {};
    if (responseData.data) {
      res.json(responseData);
    } else {
      res.json({
        code: 0,
        message: 'ok',
        data: responseData,
      });
    }
  } catch (error) {
    console.error('Error fetching download metadata:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch download metadata',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/downloadable-files
 * Gets downloadable files metadata for a movie/TV series
 * Query params: subjectId, detailPath
 */
router.get('/wefeed-h5-bff/web/subject/downloadable-files', async (req, res) => {
  try {
    const { subjectId, detailPath } = req.query;

    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId query parameter is required' });
    }

    if (!detailPath) {
      return res.status(400).json({ error: 'detailPath query parameter is required' });
    }

    // Fetch the HTML page to extract downloadable metadata
    const url = `${HOST_URL}movies/${detailPath}?id=${subjectId}`;
    const headers = getDefaultHeaders();
    
    const response = await axios.get(url, { headers });
    const html = response.data;

    // Parse the HTML to extract downloadable metadata
    const metadata = parseDownloadableMetadata(html);

    res.json({
      code: 0,
      message: 'ok',
      data: metadata,
    });
  } catch (error) {
    console.error('Error fetching downloadable files metadata:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch downloadable files metadata',
      message: error.message,
    });
  }
});

/**
 * GET /wefeed-h5-bff/web/subject/detail-rec
 * Gets recommended content based on a movie/TV series
 * Query params: subjectId, page, perPage
 * Also available at /api/recommendations/:subjectId for backward compatibility
 */
router.get('/wefeed-h5-bff/web/subject/detail-rec', async (req, res) => {
  try {
    const { subjectId, page = 1, perPage = 24 } = req.query;

    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId query parameter is required' });
    }

    const response = await makeRequest('wefeed-h5-bff/web/subject/detail-rec', {
      method: 'GET',
      params: {
        subjectId,
        page,
        perPage,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch recommendations',
      message: error.message,
    });
  }
});

// Backward compatibility
router.get('/recommendations/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, perPage = 24 } = req.query;

    const response = await makeRequest('wefeed-h5-bff/web/subject/detail-rec', {
      method: 'GET',
      params: {
        subjectId,
        page,
        perPage,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch recommendations',
      message: error.message,
    });
  }
});

/**
 * GET /api/download-proxy
 * Proxies media file downloads with proper headers
 * Query params: url, detailPath (optional, for filename), subjectId, season, episode, title, quality, resolution
 * 
 * Headers used for downloading movies:
 * - Accept: * / *
 * - User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0
 * - Origin: [The selected Moviebox host, e.g., https://h5.aoneroom.com]
 * - Referer: https://fmoviesunblocked.net/
 */
router.get('/download-proxy', async (req, res) => {
  // Log ALL requests to download-proxy (even before try block to catch everything)
  console.log('=== DOWNLOAD PROXY REQUEST RECEIVED ===');
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query),
    hasUrl: !!req.query.url,
    hasCookies: !!req.query.cookies,
    cookiesPreview: req.query.cookies ? req.query.cookies.substring(0, 100) + '...' : 'NO COOKIES IN QUERY',
  });
  
  try {
    const { url, detailPath, subjectId, season, episode, title, quality, resolution } = req.query;

    if (!url) {
      console.error('DOWNLOAD PROXY ERROR: Missing url parameter');
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    // Get cookies from query params if provided (from metadata request)
    // Also ensure we have cookies from globalCookies if query doesn't have them
    let cookies = req.query.cookies || null;
    
    // If no cookies in query, try to get from global cookies (MB_COOKIES)
    if (!cookies) {
      const { ensureCookiesAreAssigned } = require('../utils/proxy');
      cookies = await ensureCookiesAreAssigned();
      console.log('No cookies in query, using global cookies:', cookies ? 'YES' : 'NO');
    }
    
    // Get Range header from client request, or default to bytes=0-
    const range = req.headers.range || "bytes=0-";
    
    // Get media download headers with cookies and range
    // These are DIFFERENT from metadata headers - MovieBox requires strict headers for downloads
    const headers = getMediaDownloadHeaders(url, cookies, range);

    // CRITICAL: This is the ACTUAL MEDIA FILE download request (not metadata!)
    console.log('=== MEDIA FILE DOWNLOAD REQUEST ===');
    console.log('Media download request started:', {
      url: url.substring(0, 150) + (url.length > 150 ? '...' : ''),
      urlLength: url.length,
      hasCookies: !!cookies,
      cookiesPreview: cookies ? cookies.substring(0, 100) + '...' : 'NO COOKIES (may fail!)',
      cookiesFull: cookies, // Log full cookies for debugging
      range: range,
      headers: {
        referer: headers.Referer,
        origin: headers.Origin,
        userAgent: headers['User-Agent'],
        accept: headers.Accept,
        hasRange: !!headers.Range,
        hasCookieHeader: !!headers.Cookie,
      },
    });

    // Validate file availability with HEAD request before downloading
    // This checks if the file exists and is accessible before streaming
    try {
      const headHeaders = { ...headers };
      delete headHeaders.Range; // HEAD requests don't need Range header
      
      console.log('Validating file availability with HEAD request...');
      const headResponse = await axios.head(url, {
        headers: headHeaders,
        timeout: 10000, // 10 seconds for validation
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Don't throw on 4xx, we'll handle it
      });
      
      // Check for various error conditions
      if (headResponse.status === 404) {
        console.error('File not found (404) on CDN');
        return res.status(404).json({
          error: 'File not found on CDN',
          message: 'The requested file is not available. It may have been removed or the URL is invalid.',
        });
      }
      
      if (headResponse.status === 403) {
        // Could be region restriction or expired URL
        const isExpired = url.includes('sign=') || url.includes('&t=');
        console.error('Access forbidden (403):', {
          isExpired: isExpired,
          urlPreview: url.substring(0, 100) + '...',
        });
        
        if (isExpired) {
          return res.status(410).json({
            error: 'Download URL expired',
            message: 'The download URL has expired. Please try again to get a fresh URL.',
          });
        } else {
          return res.status(403).json({
            error: 'Region restriction',
            message: 'This content is not available in your region or access is restricted.',
          });
        }
      }
      
      if (headResponse.status === 401) {
        console.error('Unauthorized (401) - likely expired URL');
        return res.status(410).json({
          error: 'Download URL expired',
          message: 'The download URL has expired. Please try again to get a fresh URL.',
        });
      }
      
      if (headResponse.status >= 400) {
        console.error(`File validation failed with status ${headResponse.status}`);
        return res.status(headResponse.status).json({
          error: 'File validation failed',
          message: `The file could not be accessed (status: ${headResponse.status}).`,
        });
      }
      
      console.log('File validation successful:', {
        status: headResponse.status,
        contentType: headResponse.headers['content-type'],
        contentLength: headResponse.headers['content-length'],
      });
    } catch (validationError) {
      // Handle validation errors
      if (validationError.response) {
        const status = validationError.response.status;
        if (status === 404) {
          return res.status(404).json({
            error: 'File not found on CDN',
            message: 'The requested file is not available. It may have been removed or the URL is invalid.',
          });
        }
        if (status === 403) {
          const isExpired = url.includes('sign=') || url.includes('&t=');
          if (isExpired) {
            return res.status(410).json({
              error: 'Download URL expired',
              message: 'The download URL has expired. Please try again to get a fresh URL.',
            });
          } else {
            return res.status(403).json({
              error: 'Region restriction',
              message: 'This content is not available in your region or access is restricted.',
            });
          }
        }
        if (status === 401) {
          return res.status(410).json({
            error: 'Download URL expired',
            message: 'The download URL has expired. Please try again to get a fresh URL.',
          });
        }
      }
      
      // For other validation errors (timeout, network, etc.), log but continue
      // The actual download request will handle these
      console.warn('File validation warning (continuing with download):', validationError.message);
    }

    // Fetch the file with proper headers
    let response;
    try {
      response = await axios.get(url, {
        headers,
        responseType: 'stream',
        timeout: 300000, // 5 minutes for large files
        maxRedirects: 5,
      });
      
      // Log successful response
      console.log('Media download response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        hasStream: !!response.data,
      });
      console.log('=== END MEDIA FILE DOWNLOAD ===');
    } catch (downloadError) {
      // Log detailed error for media download
      console.error('=== MEDIA FILE DOWNLOAD FAILED ===');
      console.error('Media download error:', {
        message: downloadError.message,
        status: downloadError.response?.status,
        statusText: downloadError.response?.statusText,
        url: url.substring(0, 150) + '...',
        hasCookies: !!cookies,
        errorCode: downloadError.code,
      });
      console.error('=== END MEDIA FILE DOWNLOAD ERROR ===');
      
      // Handle specific error cases with appropriate status codes and messages
      if (downloadError.response) {
        const status = downloadError.response.status;
        if (status === 404) {
          throw {
            ...downloadError,
            userMessage: 'File not found on CDN',
            statusCode: 404,
          };
        }
        if (status === 403) {
          const isExpired = url.includes('sign=') || url.includes('&t=');
          throw {
            ...downloadError,
            userMessage: isExpired 
              ? 'Download URL expired - please try again'
              : 'Region restriction - content not available in your region',
            statusCode: isExpired ? 410 : 403,
          };
        }
        if (status === 401) {
          throw {
            ...downloadError,
            userMessage: 'Download URL expired - please try again',
            statusCode: 410,
          };
        }
      }
      
      throw downloadError; // Re-throw to be handled by outer catch
    }

    // Set CORS headers explicitly for downloads (required for cross-origin fetch)
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Allow requests with no origin (like direct downloads)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
    
    // Set appropriate headers for download
    const contentType = response.headers['content-type'] || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    
    // Generate filename based on available metadata
    const { generateMediaFilename, extractExtension } = require('../utils/filename');
    let filename = null;
    
    // Try to fetch movie details if we have detailPath and subjectId
    let movieDetails = null;
    if (detailPath && subjectId) {
      try {
        const { fetchMovieDetailsFromHTML } = require('../utils/parser');
        movieDetails = await fetchMovieDetailsFromHTML(detailPath, subjectId);
      } catch (err) {
        console.warn('Could not fetch movie details for filename:', err.message);
      }
    }
    
    // Extract metadata for filename generation
    const movieTitle = title || 
      (movieDetails?.resData?.metadata?.title) || 
      (movieDetails?.resData?.subject?.title) || 
      null;
    
    const releaseDate = movieDetails?.resData?.subject?.releaseDate || 
                       movieDetails?.resData?.metadata?.releaseDate;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
    
    // Get file extension
    const extension = extractExtension(url, contentType);
    
    // Format resolution
    let resValue = resolution;
    if (!resValue && quality && quality !== 'BEST' && quality !== 'WORST') {
      resValue = quality;
    }
    
    // Generate filename if we have enough information
    if (movieTitle) {
      filename = generateMediaFilename({
        title: movieTitle,
        year: year,
        season: season,
        episode: episode,
        resolution: resValue,
        quality: quality,
        extension: extension
      });
    }
    
    // Fallback to URL filename if we couldn't generate one
    if (!filename) {
      const urlParts = url.split('/');
      filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    }
    
    // Set Content-Disposition header with proper filename
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // Pipe the response
    response.data.pipe(res);
    
    // Log when streaming starts
    console.log('Media file streaming started to client');
    
    // Handle stream errors
    response.data.on('error', (streamError) => {
      console.error('Media stream error:', streamError.message);
    });
    
    // Log when stream ends
    response.data.on('end', () => {
      console.log('Media file stream completed');
    });
  } catch (error) {
    // This catch block handles errors from axios request or other errors
    console.error('=== DOWNLOAD PROXY ERROR ===');
    console.error('Error proxying download:', error.message);
    console.error('Download URL:', req.query.url ? req.query.url.substring(0, 150) + '...' : 'MISSING');
    console.error('Error details:', {
      status: error.response?.status || error.statusCode,
      statusText: error.response?.statusText,
      hasCookies: !!req.query.cookies,
      errorCode: error.code,
      userMessage: error.userMessage,
    });
    console.error('=== END DOWNLOAD PROXY ERROR ===');
    
    if (!res.headersSent) {
      // Use specific error message if available, otherwise use generic message
      const errorMessage = error.userMessage || error.message || 'Failed to proxy download';
      const statusCode = error.statusCode || error.response?.status || 500;
      
      // Map specific error types to user-friendly messages
      let finalMessage = errorMessage;
      if (error.response?.status === 404) {
        finalMessage = 'File not found on CDN';
      } else if (error.response?.status === 403) {
        const isExpired = req.query.url && (req.query.url.includes('sign=') || req.query.url.includes('&t='));
        finalMessage = isExpired 
          ? 'Download URL expired - please try again'
          : 'Region restriction - content not available in your region';
      } else if (error.response?.status === 401) {
        finalMessage = 'Download URL expired - please try again';
      }
      
      res.status(statusCode).json({
        error: error.response?.status === 404 ? 'File not found on CDN' :
               error.response?.status === 403 ? (req.query.url && (req.query.url.includes('sign=') || req.query.url.includes('&t=')) ? 'Download URL expired' : 'Region restriction') :
               error.response?.status === 401 ? 'Download URL expired' :
               'Failed to proxy download',
        message: finalMessage,
      });
    }
  }
});

module.exports = router;

