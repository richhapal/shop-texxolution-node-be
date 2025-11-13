const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadProductImages,
  deleteProductImage,
  uploadProductFiles,
} = require("../../controllers/fileUploadController");

const router = express.Router();

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
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
    // Basic file type check - specific validation happens in controller
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

/**
 * @route POST /uploads/products/:productId/images
 * @desc Upload multiple images for a product
 * @access Private (Admin/Editor)
 */
router.post(
  "/products/:productId/images",
  upload.array("images", 10),
  uploadProductImages
);

/**
 * @route DELETE /uploads/products/:productId/images/:imageUrl
 * @desc Delete a specific product image
 * @access Private (Admin/Editor)
 */
router.delete("/products/:productId/images/:imageUrl", deleteProductImage);

/**
 * @route POST /uploads/products/:productId/files
 * @desc Upload files (spec sheets, etc.) for a product
 * @access Private (Admin/Editor)
 */
router.post(
  "/products/:productId/files",
  upload.single("file"),
  uploadProductFiles
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = "File upload error";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large. Maximum size is 10MB.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Maximum 10 files allowed.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field.";
        break;
    }

    return res.status(400).json({
      success: false,
      message,
      error: error.code,
    });
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
