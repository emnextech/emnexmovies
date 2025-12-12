/**
 * Main Express Server
 * Movie Download Website Backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow requests from frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080']; // Default to common dev ports

// Normalize origins (remove trailing slashes)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, ''));

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is in allowed list (exact match or normalized match)
    if (normalizedOrigins.includes(normalizedOrigin) || 
        normalizedOrigins.includes(origin) ||
        allowedOrigins.includes('*')) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } 
    // Allow Vercel preview deployments (pattern: *.vercel.app)
    else if (origin.includes('.vercel.app')) {
      console.log(`CORS: Allowing Vercel preview deployment: ${origin}`);
      callback(null, true);
    } 
    else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      console.warn(`CORS: Allowed origins: ${normalizedOrigins.join(', ')}`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes - Register at guide paths (root level)
app.use('/', apiRoutes);
app.use('/api', apiRoutes); // Backward compatibility
app.use('/api', downloadRoutes);

// Health check endpoint - make it fast and simple
app.get('/health', (req, res) => {
  // Don't do any heavy operations here
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'movie-website-backend',
    version: '1.0.0',
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

// 404 handler - API only, return JSON
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: 'The requested API endpoint does not exist',
    path: req.path,
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  
  // Check if MB_COOKIES is set
  if (process.env.MB_COOKIES) {
    console.log('MB_COOKIES environment variable is set (using provided cookies)');
  } else {
    console.log('MB_COOKIES not set - will fetch cookies dynamically from MovieBox');
    // Initialize cookies in background (don't block server start) only if MB_COOKIES not set
    setTimeout(async () => {
      try {
        const { ensureCookiesAreAssigned } = require('./utils/proxy');
        await ensureCookiesAreAssigned();
      } catch (error) {
        console.warn('Cookie initialization failed (non-critical):', error.message);
      }
    }, 1000);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});


// Export for serverless functions (Render, Vercel, etc.)
module.exports = app;

