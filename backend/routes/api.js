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

    // Use download headers with correct Accept header and referer
    // Referer should be the movie detail page URL
    const headers = getDownloadHeaders(detailPath);
    
    console.log('Fetching download metadata:', { subjectId, se, ep, detailPath });
    console.log('Using headers:', JSON.stringify(headers, null, 2));

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
    
    // Extract cookies from response (required for actual file downloads)
    // MovieBox sets cookies like: account=...; i18n_lang=en
    const cookies = response.cookies || null;
    
    // Log response for debugging
    console.log('Download metadata response:', {
      hasData: !!responseData.data,
      downloadsCount: responseData.data?.downloads?.length || responseData.downloads?.length || 0,
      captionsCount: responseData.data?.captions?.length || responseData.captions?.length || 0,
      hasCookies: !!cookies,
      cookiesPreview: cookies ? cookies.substring(0, 50) + '...' : 'none',
    });
    
    // Include cookies in response so frontend can pass them to download endpoint
    if (responseData.data) {
      // If response has nested data structure
      res.json({
        ...responseData,
        _cookies: cookies, // Add cookies to response (frontend will use this)
      });
    } else if (responseData.downloads || responseData.captions) {
      // If response already has downloads/captions at root level
      res.json({
        code: 0,
        message: 'ok',
        data: responseData,
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
        },
        _cookies: cookies, // Add cookies to response (frontend will use this)
          limitedCode: '',
          freeNum: 0,
          hasResource: false,
        },
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
  try {
    const { url, detailPath, subjectId, season, episode, title, quality, resolution } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    // Get cookies from query params if provided (from metadata request)
    const cookies = req.query.cookies || null;
    
    // Get Range header from client request, or default to bytes=0-
    const range = req.headers.range || "bytes=0-";
    
    // Get media download headers with cookies and range
    // These are DIFFERENT from metadata headers - MovieBox requires strict headers for downloads
    const headers = getMediaDownloadHeaders(url, cookies, range);

    console.log('Downloading media file with headers:', {
      url: url.substring(0, 100) + '...',
      hasCookies: !!cookies,
      range: range,
      referer: headers.Referer,
      origin: headers.Origin,
      userAgent: headers['User-Agent'],
    });

    // Fetch the file with proper headers
    const response = await axios.get(url, {
      headers,
      responseType: 'stream',
      timeout: 300000, // 5 minutes for large files
      maxRedirects: 5,
    });

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
  } catch (error) {
    console.error('Error proxying download:', error.message);
    console.error('Download URL:', req.query.url);
    res.status(error.response?.status || 500).json({
      error: 'Failed to proxy download',
      message: error.message,
    });
  }
});

module.exports = router;

