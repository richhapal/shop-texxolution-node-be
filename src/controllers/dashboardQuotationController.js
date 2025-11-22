/* eslint-d    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      status,
      createdBy,
      enquiryId,
      search,
      dateFrom,
      dateTo,
      expiringIn,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (enquiryId) filter.enquiryId = enquiryId;-return */
const Quotation = require('../models/Quotation');
const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');
const categoryUnits = require('../../config/categoryUnits');
const { uploadFileFromPath, validateFile } = require('../utils/cloudflareR2');

/**
 * Get all quotations for dashboard with filtering and pagination
 */
const getDashboardQuotations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      status,
      createdBy,
      search,
      dateFrom,
      dateTo,
      expiringIn,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Expiring soon filter
    if (expiringIn) {
      const days = parseInt(expiringIn);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      filter.validUntil = { $lte: expiryDate, $gte: new Date() };
      filter.status = 'sent';
    }

    // Search filter
    if (search) {
      filter.$or = [
        { quotationNo: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
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

    // Execute query
    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .populate('enquiryId', 'enquiryNo customerName')
        // .populate('createdBy', 'name email') // Commented out due to User model registration issue
        .populate('products.productId', 'name sku category')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    // Add calculated fields
    const quotationsWithCalcs = quotations.map(quotation => ({
      ...quotation,
      subtotal: quotation.products.reduce((sum, product) => {
        const discountedPrice =
          product.unitPrice * (1 - (product.discount || 0) / 100);
        return sum + discountedPrice * product.quantity;
      }, 0),
      isExpired:
        quotation.validUntil &&
        new Date() > quotation.validUntil &&
        quotation.status === 'sent',
    }));

    res.json({
      success: true,
      message: 'Quotations retrieved successfully.',
      data: {
        quotations: quotationsWithCalcs,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalQuotations: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving quotations.',
    });
  }
};

/**
 * Create quotation from enquiry
 */
const createQuotation = async (req, res) => {
  try {
    const {
      enquiryId,
      products,
      validUntil,
      terms,
      currency = 'INR',
      taxRate = 0,
      shippingCost = 0,
      shippingMethod,
      paymentTerms = '30_days',
      customPaymentTerms,
    } = req.body;

    // Validation
    if (
      !enquiryId ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enquiry ID and products array are required.',
      });
    }

    if (!validUntil || !terms) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date and terms are required.',
      });
    }

    // Verify enquiry exists
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    // Validate products
    const quotationProducts = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      if (
        !product.productId ||
        !product.unitPrice ||
        !product.quantity ||
        !product.deliveryTime
      ) {
        return res.status(400).json({
          success: false,
          message: `Product ${
            i + 1
          }: Product ID, unit price, quantity, and delivery time are required.`,
        });
      }

      // Verify product exists
      const productExists = await Product.findById(product.productId);
      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${product.productId} not found.`,
        });
      }

      // Validate unit presence and value against category rules
      const category = productExists.category;
      const allowed = categoryUnits[category] || [];
      const providedUnit = product.unit && String(product.unit).trim();
      if (!providedUnit) {
        return res.status(400).json({
          success: false,
          message: `Invalid unit for category ${category}. Allowed units: ${JSON.stringify(allowed)}`,
        });
      }

      if (!allowed.includes(providedUnit)) {
        return res.status(400).json({
          success: false,
          message: `Invalid unit for category ${category}. Allowed units: ${JSON.stringify(allowed)}`,
        });
      }

      quotationProducts.push({
        productId: product.productId,
        productName: productExists.name,
        quantity: parseInt(product.quantity),
        unit: providedUnit || undefined,
        unitPrice: parseFloat(product.unitPrice),
        deliveryTime: product.deliveryTime.trim(),
        discount: parseFloat(product.discount) || 0,
        notes: product.notes || '',
      });
    }

    // Prepare quotation data
    const quotationData = {
      enquiryId,
      customerName: enquiry.customerName,
      company: enquiry.company,
      email: enquiry.email,
      products: quotationProducts,
      validUntil: new Date(validUntil),
      terms: terms.trim(),
      currency,
      taxRate: parseFloat(taxRate),
      shippingCost: parseFloat(shippingCost),
      shippingMethod: shippingMethod || '',
      paymentTerms,
      customPaymentTerms: customPaymentTerms || '',
      status: 'draft',
      createdBy: req.user._id,
    };

    const quotation = await Quotation.create(quotationData);

    // Update enquiry status and add activity log
    enquiry.status = 'quoted';
    enquiry.activities.push({
      type: 'quotation_created',
      description: `Quotation ${quotation.quotationNo} created for this enquiry`,
      performedBy: req.user._id,
      metadata: {
        quotationId: quotation._id,
        quotationNo: quotation.quotationNo,
        oldStatus: 'in_review',
        newStatus: 'quoted',
      },
    });
    await enquiry.save();

    // Populate for response
    await quotation.populate([
      { path: 'enquiryId', select: 'enquiryNo' },
      { path: 'createdBy', select: 'name email' },
      { path: 'products.productId', select: 'name sku category' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully.',
      data: {
        quotation,
      },
    });
  } catch (error) {
    console.error('Create quotation error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating quotation.',
    });
  }
};

/**
 * Update quotation
 */
const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Get current quotation to track status changes
    const currentQuotation = await Quotation.findById(id);
    if (!currentQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.quotationNo;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Add modifiedBy for revision tracking
    updateData.modifiedBy = req.user._id;

    // Check if status is being updated
    const statusChanged =
      updateData.status && updateData.status !== currentQuotation.status;
    const oldStatus = currentQuotation.status;
    const newStatus = updateData.status;

    // If products are being updated, validate units for each product
    if (updateData.products && Array.isArray(updateData.products)) {
      for (let i = 0; i < updateData.products.length; i++) {
        const p = updateData.products[i];
        if (p.productId) {
          const productExists = await Product.findById(p.productId).select(
            'category',
          );
          if (!productExists) {
            return res.status(400).json({
              success: false,
              message: `Product with ID ${p.productId} not found.`,
            });
          }
          const category = productExists.category;
          const allowed = categoryUnits[category] || [];
          const providedUnit = p.unit && String(p.unit).trim();
          if (!providedUnit) {
            return res.status(400).json({
              success: false,
              message: `Invalid unit for category ${category}. Allowed units: ${JSON.stringify(allowed)}`,
            });
          }
          if (!allowed.includes(providedUnit)) {
            return res.status(400).json({
              success: false,
              message: `Invalid unit for category ${category}. Allowed units: ${JSON.stringify(
                allowed,
              )}`,
            });
          }
        }
      }
    }

    const quotation = await Quotation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'enquiryId', select: 'enquiryNo' },
      { path: 'createdBy', select: 'name email' },
      { path: 'products.productId', select: 'name sku category' },
    ]);

    // Handle status change activities and enquiry updates
    if (statusChanged) {
      const enquiry = await Enquiry.findById(quotation.enquiryId);
      if (enquiry) {
        let activityType = 'status_updated';
        let description = `Quotation ${quotation.quotationNo} status updated from ${oldStatus} to ${newStatus}`;
        let enquiryStatusUpdate = null;

        // Handle specific status changes
        if (newStatus === 'accepted') {
          activityType = 'quotation_accepted';
          description = `Quotation ${quotation.quotationNo} was accepted by customer`;
          enquiryStatusUpdate = 'closed';
        } else if (newStatus === 'declined') {
          activityType = 'quotation_rejected';
          description = `Quotation ${quotation.quotationNo} was rejected by customer`;
          enquiryStatusUpdate = 'rejected';
        }

        // Add activity log
        enquiry.activities.push({
          type: activityType,
          description,
          performedBy: req.user._id,
          metadata: {
            quotationId: quotation._id,
            quotationNo: quotation.quotationNo,
            oldStatus,
            newStatus,
          },
        });

        // Update enquiry status if needed
        if (enquiryStatusUpdate) {
          enquiry.status = enquiryStatusUpdate;
        }

        await enquiry.save();
      }
    }

    res.json({
      success: true,
      message: 'Quotation updated successfully.',
      data: {
        quotation,
      },
    });
  } catch (error) {
    console.error('Update quotation error:', error);

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
        message: 'Invalid quotation ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating quotation.',
    });
  }
};

/**
 * Upload PDF to Cloudflare R2 and update quotation
 */
const uploadQuotationPDF = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required.',
      });
    }

    // Validate file
    const validation = validateFile(
      req.file,
      ['application/pdf'],
      10 * 1024 * 1024,
    );
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed.',
        errors: validation.errors,
      });
    }

    // Verify quotation exists
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    // Generate filename
    const fileName = `quotations/${quotation.quotationNo}/quotation_${quotation.quotationNo}.pdf`;

    // Upload to Cloudflare R2
    const uploadResult = await uploadFileFromPath(
      req.file.path,
      fileName,
      'application/pdf',
      {
        'quotation-no': quotation.quotationNo,
        'uploaded-by': req.user._id.toString(),
        'quotation-id': quotation._id.toString(),
      },
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload PDF to R2.',
      });
    }

    // Update quotation with PDF link
    quotation.pdfLink = uploadResult.publicUrl;
    await quotation.save();

    res.json({
      success: true,
      message: 'PDF uploaded successfully to Cloudflare R2.',
      data: {
        pdfLink: quotation.pdfLink,
        quotationNo: quotation.quotationNo,
        fileName: uploadResult.fileName,
      },
    });
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while uploading PDF to R2.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single quotation details
 */
const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findById(id)
      .populate('enquiryId', 'enquiryNo customerName company message')
      // .populate('createdBy', 'name email department') // Commented out due to User model registration issue
      .populate(
        'products.productId',
        'name sku category images.main pricing.basePrice',
      )
      // .populate('internalNotes.addedBy', 'name email') // Commented out due to User model registration issue
      .lean();

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    // Add calculated fields
    const subtotal = quotation.products.reduce((sum, product) => {
      const discountedPrice =
        product.unitPrice * (1 - (product.discount || 0) / 100);
      return sum + discountedPrice * product.quantity;
    }, 0);

    const taxAmount = (subtotal * (quotation.taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount + (quotation.shippingCost || 0);

    res.json({
      success: true,
      message: 'Quotation retrieved successfully.',
      data: {
        quotation: {
          ...quotation,
          subtotal,
          taxAmount,
          totalAmount,
          isExpired:
            quotation.validUntil &&
            new Date() > quotation.validUntil &&
            quotation.status === 'sent',
        },
      },
    });
  } catch (error) {
    console.error('Get quotation by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quotation ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving quotation.',
    });
  }
};

/**
 * Send quotation to customer
 */
const sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    if (quotation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft quotations can be sent.',
      });
    }

    // Mark as sent
    await quotation.markAsSent(req.user._id);

    // Add activity log to enquiry
    const enquiry = await Enquiry.findById(quotation.enquiryId);
    if (enquiry) {
      enquiry.activities.push({
        type: 'quotation_sent',
        description: `Quotation ${quotation.quotationNo} sent to customer`,
        performedBy: req.user._id,
        metadata: {
          quotationId: quotation._id,
          quotationNo: quotation.quotationNo,
        },
      });
      await enquiry.save();
    }

    // In a real application, you would send an email here
    // await emailService.sendQuotation(quotation);

    res.json({
      success: true,
      message: 'Quotation sent successfully.',
      data: {
        quotation: {
          _id: quotation._id,
          quotationNo: quotation.quotationNo,
          status: quotation.status,
          sentAt: quotation.sentAt,
        },
      },
    });
  } catch (error) {
    console.error('Send quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending quotation.',
    });
  }
};

/**
 * Get quotation statistics for dashboard
 */
const getQuotationStats = async (req, res) => {
  try {
    const [
      totalQuotations,
      quotationsByStatus,
      expiredQuotations,
      pendingQuotations,
      acceptedQuotations,
      recentQuotations,
      conversionRate,
    ] = await Promise.all([
      Quotation.countDocuments(),
      Quotation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Quotation.countDocuments({
        validUntil: { $lt: new Date() },
        status: 'sent',
      }),
      Quotation.countDocuments({ status: 'sent' }),
      Quotation.countDocuments({ status: 'accepted' }),
      Quotation.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('quotationNo customerName company status validUntil createdAt'),
      // .populate('createdBy', 'name'), // Commented out due to User model registration issue
      Quotation.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            accepted: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            conversionRate: {
              $cond: [
                { $eq: ['$total', 0] },
                0,
                { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] },
              ],
            },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      message: 'Quotation statistics retrieved successfully.',
      data: {
        total: totalQuotations,
        byStatus: quotationsByStatus,
        expired: expiredQuotations,
        pending: pendingQuotations,
        accepted: acceptedQuotations,
        recent: recentQuotations,
        conversionRate: conversionRate[0]?.conversionRate || 0,
      },
    });
  } catch (error) {
    console.error('Get quotation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics.',
    });
  }
};

module.exports = {
  getDashboardQuotations,
  createQuotation,
  updateQuotation,
  uploadQuotationPDF,
  getQuotationById,
  sendQuotation,
  getQuotationStats,
};
