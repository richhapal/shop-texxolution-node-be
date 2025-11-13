const express = require("express");
const router = express.Router();

// Import individual public route modules
const productRoutes = require("./products");

// Mount routes - note: products.js already has "/products" and other paths
router.use("/", productRoutes);

module.exports = router;
