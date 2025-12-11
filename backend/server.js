/**
 * Main Express Server
 * Movie Download Website Backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes - Register at guide paths (root level)
app.use('/', apiRoutes);
app.use('/api', apiRoutes); // Backward compatibility
app.use('/api', downloadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for Vercel debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1',
    path: req.path,
    url: req.url,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  // For API endpoints, return JSON
  if (req.path.startsWith('/api') || req.path.startsWith('/wefeed-h5-bff') || req.path.startsWith('/health')) {
    res.status(404).json({ error: 'Not found', message: 'The requested API endpoint does not exist' });
  } else {
    // For frontend routes, serve the 404.html page
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
  }
});

// Start server (only in development or when not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;

