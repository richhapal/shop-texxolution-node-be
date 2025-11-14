/**
 * 🧩 Shop Texxolution Backend Standards
 * - API Contract v3.0 (https://shop-texxolution-node-be.onrender.com)
 * - Consistent response format: { success, message, data }
 * - JWT-secured dashboard routes
 * - Flexible categoryData for product fields
 * - Redis caching for public endpoints
 * - Cloudflare R2 for file storage
 * - Centralized errorHandler
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { restrictTo } = require('../../middleware/auth');
const {
  getDashboardQuotations,
  createQuotation,
  updateQuotation,
  uploadQuotationPDF,
  getQuotationById,
  sendQuotation,
  getQuotationStats,
} = require('../../controllers/dashboardQuotationController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/quotations/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// File filter to allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ==================== QUOTATION CRUD ROUTES ====================

/**
 * GET /api/dashboard/quotations
 * Get all quotations with filtering and pagination
 * Access: All authenticated users
 * Query params: page, limit, sort, status, createdBy, search, dateFrom, dateTo, expiringIn
 */
router.get('/', getDashboardQuotations);

/**
 * POST /api/dashboard/quotations
 * Create quotation from enquiry
 * Access: Admin, Editor
 * Body: { enquiryId, products, validUntil, terms, currency?, taxRate?, shippingCost?, paymentTerms? }
 */
router.post('/', restrictTo('admin', 'editor'), createQuotation);

/**
 * GET /api/dashboard/quotations/stats
 * Get quotation statistics for dashboard
 * Access: All authenticated users
 */
router.get('/stats', getQuotationStats);

/**
 * GET /api/dashboard/quotations/:id
 * Get single quotation details
 * Access: All authenticated users
 */
router.get('/:id', getQuotationById);

/**
 * PATCH /api/dashboard/quotations/:id
 * Update quotation details
 * Access: Admin, Editor (only if status is draft)
 * Body: Updated quotation fields
 */
router.patch('/:id', restrictTo('admin', 'editor'), updateQuotation);

/**
 * POST /api/dashboard/quotations/:id/send
 * Send quotation to customer
 * Access: Admin, Editor
 */
router.post('/:id/send', restrictTo('admin', 'editor'), sendQuotation);

// ==================== PDF UPLOAD ROUTES ====================

/**
 * POST /api/dashboard/quotations/:id/pdf
 * Upload PDF file to Cloudinary and update quotation
 * Access: Admin, Editor
 * Body: Form-data with 'pdf' file field
 */
router.post(
  '/:id/pdf',
  restrictTo('admin', 'editor'),
  upload.single('pdf'),
  uploadQuotationPDF,
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 10MB.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message,
    });
  }

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed for quotation documents.',
    });
  }

  // Always return the result of next to satisfy the linter/compile rule
  return next(error);
});

module.exports = router;
