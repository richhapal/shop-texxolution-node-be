/* eslint-disable consistent-return */
const Product = require('../models/Product');
const { ProductCache } = require('../utils/redisCache');
const {
  uploadMultipleImages,
  uploadFileFromPath,
  validateFile,
} = require('../utils/cloudflareR2');

/**
 * Get all products for dashboard with filtering and pagination
 */
const getDashboardProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      status,
      search,
      createdBy,
      minPrice,
      maxPrice,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortObj[field.slice(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query (populate commented out due to User model registration issue)
    const [products, total] = await Promise.all([
      Product.find(filter)
        // .populate('createdBy', 'name email')
        // .populate('updatedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      message: 'Products retrieved successfully.',
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving products.',
    });
  }
};

/**
 * Create new product with Lovable form fields
 */
const createProduct = async (req, res) => {
  try {
    const {
      // Shared fields
      sku,
      name,
      category,
      description,
      images,
      composition,
      color,
      width,
      gsm,
      finish,
      application,
      moq,
      leadTime,
      tags,
      specSheet,
      status = 'draft',

      // Category-specific data from Lovable form
      categoryData = {},

      // Pricing and SEO
      pricing,
      seo,
      vendor,
    } = req.body;

    // Validation
    if (!sku || !name || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'SKU, name, category, and description are required.',
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
      });
    }

    // Prepare product data
    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      category,
      description: description.trim(),
      images: images || { main: '', gallery: [] },
      composition: composition || '',
      color: color || '',
      width: width || '',
      gsm: gsm || 0,
      finish: finish || '',
      application: application || '',
      moq: moq || 1,
      leadTime: leadTime || '',
      tags: tags || [],
      specSheet: specSheet || '',
      status,
      categoryData: categoryData || {},
      pricing: pricing || { basePrice: 0, currency: 'USD' },
      seo: seo || {},
      vendor: vendor || {},
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    // Create product
    const product = await Product.create(productData);

    // Populate creator info for response (commented out due to User model registration issue)
    // await product.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating product.',
    });
  }
};

/**
 * Create new product with images uploaded simultaneously
 */
const createProductWithImages = async (req, res) => {
  try {
    // Parse JSON data from form field
    let productData;
    try {
      productData = JSON.parse(req.body.productData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product data JSON format.',
      });
    }

    const {
      sku,
      name,
      category,
      description,
      composition,
      color,
      width,
      gsm,
      finish,
      application,
      moq,
      leadTime,
      tags,
      status = 'draft',
      categoryData = {},
      pricing,
      seo,
      vendor,
    } = productData;

    // Validation
    if (!sku || !name || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'SKU, name, category, and description are required.',
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
      });
    }

    // Generate unique ID (manual generation to ensure it's set)
    const generateUniqueId = (name, category) => {
      const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 8);

      const categoryShort = category.toLowerCase().substring(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      return `${cleanName}-${categoryShort}-${timestamp}`;
    };

    // Prepare base product data
    const newProductData = {
      sku: sku.trim(),
      uniqueId: generateUniqueId(name, category),
      name: name.trim(),
      category,
      description: description.trim(),
      images: {
        main: `https://via.placeholder.com/400x300?text=${encodeURIComponent(name)}`,
        gallery: [],
      },
      composition: composition.trim(),
      color: color.trim(),
      width: width.trim(),
      gsm: gsm || 0,
      finish: finish.trim(),
      application: application.trim(),
      moq: moq || 1,
      leadTime: leadTime.trim(),
      tags: tags || [],
      specSheet: '',
      status,
      categoryData: categoryData || {},
      pricing: pricing || { basePrice: 0, currency: 'USD' },
      seo: seo || {},
      vendor: vendor || {},
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    // Create product first
    const product = await Product.create(newProductData);

    // Handle file uploads if any
    const uploadedFiles = {
      mainImage: null,
      galleryImages: [],
      specSheet: null,
    };

    try {
      // Upload main image if provided
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImageFile = req.files.mainImage[0];

        // Validate image file
        const validation = validateFile(
          mainImageFile,
          ['image/jpeg', 'image/png', 'image/webp'],
          5 * 1024 * 1024,
        );
        if (validation.isValid) {
          const folderPath = `products/${product.sku}/images`;
          const fileName = `${folderPath}/main_${Date.now()}.${mainImageFile.originalname
            .split('.')
            .pop()}`;

          const uploadResult = await uploadFileFromPath(
            mainImageFile.path,
            fileName,
            mainImageFile.mimetype,
            {
              'product-id': product._id.toString(),
              'product-sku': product.sku,
              'uploaded-by': req.user._id.toString(),
              'image-type': 'main',
            },
          );

          if (uploadResult.success) {
            uploadedFiles.mainImage = uploadResult.publicUrl;
            product.images.main = uploadResult.publicUrl;
          }
        }
      }

      // Upload gallery images if provided
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        const folderPath = `products/${product.sku}/images`;
        const metadata = {
          'product-id': product._id.toString(),
          'product-sku': product.sku,
          'uploaded-by': req.user._id.toString(),
          'image-type': 'gallery',
        };

        // Filter and validate gallery images
        const validGalleryImages = req.files.galleryImages.filter(file => {
          const validation = validateFile(
            file,
            ['image/jpeg', 'image/png', 'image/webp'],
            5 * 1024 * 1024,
          );
          return validation.isValid;
        });

        if (validGalleryImages.length > 0) {
          const uploadResults = await uploadMultipleImages(
            validGalleryImages,
            folderPath,
            metadata,
          );
          uploadedFiles.galleryImages = uploadResults.map(
            result => result.publicUrl,
          );
          product.images.gallery = uploadedFiles.galleryImages;
        }
      }

      // Upload spec sheet if provided
      if (req.files.specSheet && req.files.specSheet[0]) {
        const specFile = req.files.specSheet[0];

        // Validate spec file
        const validation = validateFile(
          specFile,
          ['application/pdf'],
          10 * 1024 * 1024,
        );
        if (validation.isValid) {
          const folderPath = `products/${product.sku}/files`;
          const fileName = `${folderPath}/spec_${
            product.sku
          }_${Date.now()}.${specFile.originalname.split('.').pop()}`;

          const uploadResult = await uploadFileFromPath(
            specFile.path,
            fileName,
            specFile.mimetype,
            {
              'product-id': product._id.toString(),
              'product-sku': product.sku,
              'uploaded-by': req.user._id.toString(),
              'file-type': 'spec',
            },
          );

          if (uploadResult.success) {
            uploadedFiles.specSheet = uploadResult.publicUrl;
            product.specSheet = uploadResult.publicUrl;
          }
        }
      }

      // Save product with uploaded file URLs
      await product.save();
    } catch (uploadError) {
      console.error('File upload error during product creation:', uploadError);
      // Note: Product is already created, so we don't delete it
      // Files that failed to upload will just be empty in the product
    }

    // Populate creator info for response (commented out due to User model registration issue)
    // await product.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully with files.',
      data: {
        product,
        uploadedFiles,
      },
    });
  } catch (error) {
    console.error('Create product with images error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating product with images.',
    });
  }
};

/**
 * Update product with Lovable form fields
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Add updatedBy
    updateData.updatedBy = req.user._id;

    // Check if SKU is being changed and validate uniqueness
    if (updateData.sku) {
      const existingProduct = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: id },
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'A product with this SKU already exists.',
        });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: 'query',
    }).populate('createdBy updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Invalidate product caches
    await ProductCache.invalidateProductCaches(product.uniqueId);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating product.',
    });
  }
};

/**
 * Get single product for editing
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('createdBy updatedBy', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully.',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Get product by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving product.',
    });
  }
};

/**
 * Delete product (soft delete - change status to discontinued)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Soft delete - change status to discontinued
    product.status = 'discontinued';
    product.updatedBy = req.user._id;
    await product.save();

    // Invalidate product caches
    await ProductCache.invalidateProductCaches(product.uniqueId);

    res.json({
      success: true,
      message: 'Product deleted successfully.',
      data: {
        product: {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          status: product.status,
        },
      },
    });
  } catch (error) {
    console.error('Delete product error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product.',
    });
  }
};

/**
 * Bulk update products
 */
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required.',
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required.',
      });
    }

    // Add updatedBy to update data
    updateData.updatedBy = req.user._id;

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData,
      { runValidators: true },
    );

    // Invalidate all product caches since multiple products were updated
    await ProductCache.clearAllProductCaches();

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully.`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk update.',
    });
  }
};

/**
 * Get product statistics for dashboard
 */
const getProductStats = async (req, res) => {
  try {
    const [
      totalProducts,
      productsByStatus,
      productsByCategory,
      recentProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Product.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name sku status createdAt')
        .populate('createdBy', 'name'),
    ]);

    const statsData = {
      total: totalProducts,
      byStatus: productsByStatus,
      byCategory: productsByCategory,
      recent: recentProducts,
    };

    res.json({
      success: true,
      message: 'Product statistics retrieved successfully.',
      data: statsData,
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics.',
    });
  }
};

module.exports = {
  getDashboardProducts,
  createProduct,
  createProductWithImages,
  updateProduct,
  getProductById,
  deleteProduct,
  bulkUpdateProducts,
  getProductStats,
};
