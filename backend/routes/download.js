/**
 * Download Routes
 * Handles file streaming for downloads
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getDownloadHeaders } = require('../utils/headers');

/**
 * GET /api/download
 * Streams video files to browser
 */
router.get('/download', async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Get download headers
    const headers = getDownloadHeaders();

    // Make request to video URL with streaming
    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      responseType: 'stream',
      timeout: 300000, // 5 minutes for large files
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
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength, 10) - 1;
      const chunksize = end - start + 1;

      res.status(206); // Partial Content
      res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);

      // Stream the requested range
      const stream = await axios({
        method: 'GET',
        url: url,
        headers: {
          ...headers,
          Range: `bytes=${start}-${end}`,
        },
        responseType: 'stream',
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
 */
router.get('/download-subtitle', async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const headers = getDownloadHeaders();

    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      responseType: 'stream',
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

