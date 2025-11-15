/**
 * 📦 Product Management Dashboard Routes
 * Complete CRUD operations for textile product catalog management.
 * Features: uniqueId generation, categoryData flexibility, image uploads, cache invalidation.
 * Routes: GET /products, POST /products, GET /stats, PUT /:id, DELETE /:id
 * Access: Admin (full), Editor (create/update), Viewer (read-only)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { restrictTo } = require('../../middleware/auth');
const {
  getDashboardProducts,
  createProduct,
  createProductWithImages,
  updateProduct,
  updateProductWithImages,
  getProductById,
  deleteProduct,
  bulkUpdateProducts,
  getProductStats,
} = require('../../controllers/dashboardProductController');

const router = express.Router();

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

// ==================== PRODUCT CRUD ROUTES ====================

/**
 * GET /api/dashboard/products
 * Get all products with filtering and pagination
 * Access: All authenticated users
 * Query params: page, limit, sort, category, status, search, createdBy, minPrice, maxPrice
 */
router.get('/', getDashboardProducts);

/**
 * POST /api/dashboard/products
 * Create new product with Lovable form fields including categoryData
 * Access: Admin, Editor
 * Body: Complete product object with categoryData JSON
 */
router.post('/', restrictTo('admin', 'editor'), createProduct);

/**
 * POST /api/dashboard/products/with-images
 * Create new product with images uploaded simultaneously
 * Access: Admin, Editor
 * Body: multipart/form-data with product data and image files
 */
router.post(
  '/with-images',
  restrictTo('admin', 'editor'),
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 9 },
    { name: 'specSheet', maxCount: 1 },
  ]),
  createProductWithImages,
);

/**
 * GET /api/dashboard/products/stats
 * Get product statistics for dashboard
 * Access: All authenticated users
 */
router.get('/stats', getProductStats);

/**
 * GET /api/dashboard/products/:id
 * Get single product details for editing
 * Access: All authenticated users
 */
router.get('/:id', getProductById);

/**
 * PUT /api/dashboard/products/:id/images
 * Update existing product with productData JSON and images using FormData
 * Access: Admin, Editor
 * Body: FormData with productData JSON field and image files
 */
router.put(
  '/:id/images',
  restrictTo('admin', 'editor'),
  upload.any(), // Allow any fields (both files and text)
  updateProductWithImages,
);

/**
 * PUT /api/dashboard/products/:id
 * Update existing product with FormData (supports both text and images)
 * Access: Admin, Editor
 * Body: FormData with individual fields and optional image files
 */
router.put(
  '/:id',
  restrictTo('admin', 'editor'),
  upload.any(), // Allow any fields (both files and text)
  updateProduct,
);

/**
 * DELETE /api/dashboard/products/:id
 * Delete product (soft delete - change status to discontinued)
 * Access: Admin only
 */
router.delete('/:id', restrictTo('admin'), deleteProduct);

// ==================== BULK OPERATIONS ====================

/**
 * PATCH /api/dashboard/products/bulk
 * Bulk update products
 * Access: Admin, Editor
 * Body: { productIds: string[], updateData: object }
 */
router.patch('/bulk', restrictTo('admin', 'editor'), bulkUpdateProducts);

module.exports = router;
