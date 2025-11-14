/**
 * 🌐 Public Routes Index
 * Router aggregator for all public endpoints (no authentication required).
 * Includes product browsing, enquiry submission, and catalog search functionality.
 * Base path: /api/public
 */

const express = require('express');
const router = express.Router();

// Import individual public route modules
const productRoutes = require('./products');

// Mount routes - note: products.js already has "/products" and other paths
router.use('/', productRoutes);

module.exports = router;
