const Product = require("../models/Product");

/**
 * Get all active products with optional filtering
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20,
      sort = "-createdAt",
      search,
      minPrice,
      maxPrice,
      color,
      gsm,
      tags,
    } = req.query;

    // Build filter object
    const filter = { status: "active" };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search filter (name, description, tags)
    if (search) {
      filter.$text = { $search: search };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter["pricing.basePrice"] = {};
      if (minPrice) filter["pricing.basePrice"].$gte = parseFloat(minPrice);
      if (maxPrice) filter["pricing.basePrice"].$lte = parseFloat(maxPrice);
    }

    // Color filter
    if (color) {
      filter.color = new RegExp(color, "i");
    }

    // GSM filter
    if (gsm) {
      filter.gsm = parseInt(gsm);
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build sort object
    let sortObj = {};
    if (sort) {
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortObj[field.slice(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("-vendor -createdBy -updatedBy")
        .populate("categoryData")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      message: "Products retrieved successfully.",
      data: {
        products: products.map((product) => ({
          ...product,
          finalPrice:
            product.pricing.basePrice *
            (1 - (product.pricing.discountPercent || 0) / 100),
          isAvailable: product.inventory?.trackInventory
            ? product.inventory.inStock - product.inventory.reserved > 0
            : true,
        })),
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving products.",
    });
  }
};

/**
 * Get single product details by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, status: "active" })
      .select("-vendor -createdBy -updatedBy")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not available.",
      });
    }

    // Add calculated fields
    const productWithCalcs = {
      ...product,
      finalPrice:
        product.pricing.basePrice *
        (1 - (product.pricing.discountPercent || 0) / 100),
      isAvailable: product.inventory?.trackInventory
        ? product.inventory.inStock - product.inventory.reserved > 0
        : true,
    };

    res.json({
      success: true,
      message: "Product retrieved successfully.",
      data: {
        product: productWithCalcs,
      },
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving product.",
    });
  }
};

/**
 * Get all product categories with counts
 */
const getCategories = async (req, res) => {
  try {
    // Get categories with product counts
    const categories = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$pricing.basePrice" },
          minPrice: { $min: "$pricing.basePrice" },
          maxPrice: { $max: "$pricing.basePrice" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          minPrice: { $round: ["$minPrice", 2] },
          maxPrice: { $round: ["$maxPrice", 2] },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Get total product count
    const totalProducts = await Product.countDocuments({ status: "active" });

    res.json({
      success: true,
      message: "Categories retrieved successfully.",
      data: {
        categories,
        totalProducts,
        totalCategories: categories.length,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving categories.",
    });
  }
};

/**
 * Search products with advanced filters
 */
const searchProducts = async (req, res) => {
  try {
    const {
      q: query,
      category,
      page = 1,
      limit = 20,
      sort = "relevance",
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    // Build search filter
    const filter = {
      status: "active",
      $text: { $search: query },
    };

    if (category) {
      filter.category = category;
    }

    // Build sort object
    let sortObj = { score: { $meta: "textScore" } };
    if (sort === "price_asc") sortObj = { "pricing.basePrice": 1 };
    if (sort === "price_desc") sortObj = { "pricing.basePrice": -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "name") sortObj = { name: 1 };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute search
    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: "textScore" } })
        .select("-vendor -createdBy -updatedBy")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      message: "Search completed successfully.",
      data: {
        products: products.map((product) => ({
          ...product,
          finalPrice:
            product.pricing.basePrice *
            (1 - (product.pricing.discountPercent || 0) / 100),
          relevanceScore: product.score,
        })),
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalResults: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
        },
        searchQuery: query,
      },
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during product search.",
    });
  }
};

/**
 * Get related products based on category and tags
 */
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    // Get the current product
    const currentProduct = await Product.findOne({ _id: id, status: "active" })
      .select("category tags")
      .lean();

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Find related products
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      status: "active",
      $or: [
        { category: currentProduct.category },
        { tags: { $in: currentProduct.tags || [] } },
      ],
    })
      .select("-vendor -createdBy -updatedBy")
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      message: "Related products retrieved successfully.",
      data: {
        products: relatedProducts.map((product) => ({
          ...product,
          finalPrice:
            product.pricing.basePrice *
            (1 - (product.pricing.discountPercent || 0) / 100),
        })),
      },
    });
  } catch (error) {
    console.error("Get related products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving related products.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  searchProducts,
  getRelatedProducts,
};
