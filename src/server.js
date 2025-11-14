/**
 * 🚀 Shop Texxolution API Server
 * Main Express server configuration with MongoDB connection, CORS setup,
 * and route mounting for public (no auth) and dashboard (JWT auth) endpoints.
 * Includes health check endpoint and centralized error handling.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// Routes
// Import route modules
const publicRoutes = require('./routes/public');
const dashboardRoutes = require('./routes/dashboard');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    // MongoDB connected successfully - no console output needed in production
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Shop Texxolution API',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount routes
app.use('/api/public', publicRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Server started successfully - console output only for development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Server is running on port ${PORT}`);
    console.warn(`Environment: ${process.env.NODE_ENV}`);
    console.warn(`API URL: http://localhost:${PORT}`);
  }
});

module.exports = app;
