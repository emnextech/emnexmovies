/**
 * Download Routes
 * Handles file streaming for downloads
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/download
 * Streams video files to browser
 * Query params: url, filename, cookies (optional - cookies from metadata page)
 */
router.get('/download', async (req, res) => {
  try {
    const { url, filename, cookies } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Get media download headers (NOT metadata headers - these are different!)
    // Include cookies from metadata request if provided
    const range = req.headers.range || "bytes=0-";
    const headers = require('../utils/headers').getMediaDownloadHeaders(url, cookies, range);

    // Make request to video URL with streaming
    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      responseType: 'stream',
      timeout: 300000, // 5 minutes for large files
      maxRedirects: 5,
    });

    // Set response headers
    const contentType = response.headers['content-type'] || 'video/mp4';
    const contentLength = response.headers['content-length'];
    const contentDisposition = filename
      ? `attachment; filename="${encodeURIComponent(filename)}"`
      : 'attachment';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Handle Range requests for resumable downloads
    const clientRange = req.headers.range;
    if (clientRange && contentLength) {
      const parts = clientRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength, 10) - 1;
      const chunksize = end - start + 1;

      res.status(206); // Partial Content
      res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);

      // Get headers with specific range for this request
      const rangeHeaders = require('../utils/headers').getMediaDownloadHeaders(url, cookies, `bytes=${start}-${end}`);

      // Stream the requested range
      const stream = await axios({
        method: 'GET',
        url: url,
        headers: rangeHeaders,
        responseType: 'stream',
        timeout: 300000,
        maxRedirects: 5,
      });

      stream.data.pipe(res);
    } else {
      // Stream entire file
      response.data.pipe(res);
    }
  } catch (error) {
    console.error('Error downloading file:', error.message);
    
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({
        error: 'Download failed',
        message: error.message,
      });
    }
  }
});

/**
 * GET /api/download-subtitle
 * Downloads subtitle files
 * Query params: url, filename, cookies (optional - cookies from metadata page)
 */
router.get('/download-subtitle', async (req, res) => {
  try {
    const { url, filename, cookies } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Use media download headers for subtitles too (they may also require cookies)
    const headers = require('../utils/headers').getMediaDownloadHeaders(url, cookies, "bytes=0-");

    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      responseType: 'stream',
      timeout: 60000, // 1 minute for subtitle files
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || 'text/vtt';
    const contentDisposition = filename
      ? `attachment; filename="${encodeURIComponent(filename)}"`
      : 'attachment';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);

    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading subtitle:', error.message);
    
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({
        error: 'Subtitle download failed',
        message: error.message,
      });
    }
  }
});

module.exports = router;

