/**
 * 🛍️ Public Product Catalog Routes
 * Handles product browsing, filtering, search, and enquiry submission.
 * Features: Redis caching, rate limiting, SEO-friendly uniqueId lookups.
 * Routes: GET /products, GET /products/:uniqueId, POST /enquiries
 * No authentication required - public access for customers.
 */

const express = require('express');
const {
  getProducts,
  getProductById,
  getCategories,
  searchProducts,
  getRelatedProducts,
} = require('../../controllers/productController');
const {
  createEnquiry,
  getEnquiryStatus,
  subscribeNewsletter,
  submitContactForm,
} = require('../../controllers/enquiryController');

const router = express.Router();

// Rate limiting middleware for public routes
const rateLimit = require('express-rate-limit');

// General rate limiter for most routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 form submissions per windowMs
  message: {
    success: false,
    message: 'Too many form submissions, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// ==================== PRODUCT ROUTES ====================

/**
 * GET /api/public/products
 * Get all active products with optional filtering
 * Query params: category, page, limit, sort, search, minPrice, maxPrice, color, gsm, tags
 */
router.get('/products', getProducts);

/**
 * GET /api/public/products/search
 * Search products with advanced text search
 * Query params: q (query), category, page, limit, sort
 */
router.get('/products/search', searchProducts);

/**
 * GET /api/public/products/:id
 * Get single product details by ID
 */
router.get('/products/:id', getProductById);

/**
 * GET /api/public/products/:id/related
 * Get related products based on category and tags
 * Query params: limit
 */
router.get('/products/:id/related', getRelatedProducts);

// ==================== CATEGORY ROUTES ====================

/**
 * GET /api/public/categories
 * Get all product categories with counts and price ranges
 */
router.get('/categories', getCategories);

// ==================== ENQUIRY ROUTES ====================

/**
 * POST /api/public/enquiry
 * Create new product enquiry
 * Body: { customerName, company, email, phone, message, products: [{ productId, quantity, notes }], attachments? }
 */
router.post('/enquiry', formLimiter, createEnquiry);

/**
 * GET /api/public/enquiry/:enquiryNo/status
 * Get enquiry status by enquiry number
 * Query params: email (required for verification)
 */
router.get('/enquiry/:enquiryNo/status', getEnquiryStatus);

// ==================== CONTACT & NEWSLETTER ROUTES ====================

/**
 * POST /api/public/contact
 * Submit general contact form
 * Body: { name, email, subject, message }
 */
router.post('/contact', formLimiter, submitContactForm);

/**
 * POST /api/public/newsletter
 * Subscribe to newsletter
 * Body: { email, name? }
 */
router.post('/newsletter', formLimiter, subscribeNewsletter);

// ==================== UTILITY ROUTES ====================

/**
 * GET /api/public/health
 * Public health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Public API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api/public/products',
      categories: '/api/public/categories',
      enquiry: '/api/public/enquiry',
      contact: '/api/public/contact',
      newsletter: '/api/public/newsletter',
    },
  });
});

/**
 * GET /api/public/stats
 * Get public statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const Product = require('../../models/Product');
    const Enquiry = require('../../models/Enquiry');

    // Get basic stats
    const [totalProducts, totalCategories, totalEnquiries, recentEnquiries] =
      await Promise.all([
        Product.countDocuments({ status: 'active' }),
        Product.distinct('category', { status: 'active' }).then(
          cats => cats.length,
        ),
        Enquiry.countDocuments(),
        Enquiry.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully.',
      data: {
        products: {
          total: totalProducts,
          categories: totalCategories,
        },
        enquiries: {
          total: totalEnquiries,
          thisWeek: recentEnquiries,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics.',
    });
  }
});

module.exports = router;
