const express = require("express");
const router = express.Router();

// Import individual dashboard route modules
const authRoutes = require("./auth");
const productRoutes = require("./products");
const enquiryRoutes = require("./enquiries");
const quotationRoutes = require("./quotations");
const uploadRoutes = require("./uploads");

// Import authentication middleware
const { requireAuth } = require("../../middleware/auth");

// Auth routes (no authentication required)
router.use("/auth", authRoutes);

// Protected routes (authentication required)
router.use("/products", requireAuth, productRoutes);
router.use("/enquiries", requireAuth, enquiryRoutes);
router.use("/quotations", requireAuth, quotationRoutes);
router.use("/uploads", requireAuth, uploadRoutes);

module.exports = router;
