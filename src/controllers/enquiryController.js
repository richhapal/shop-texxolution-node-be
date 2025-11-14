/* eslint-disable consistent-return */
const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');

/**
 * Create new enquiry from public form
 */
const createEnquiry = async (req, res) => {
  try {
    const {
      customerName,
      company,
      email,
      phone,
      message,
      products,
      source = 'website',
    } = req.body;

    // Validation
    if (!customerName || !company || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All customer information fields are required.',
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product must be specified in the enquiry.',
      });
    }

    // Validate products
    const productValidation = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      if (!product.productId || !product.quantity || product.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Product ${
            i + 1
          }: Product ID and valid quantity are required.`,
        });
      }

      // Verify product exists and is active
      const productExists = await Product.findOne({
        _id: product.productId,
        status: 'active',
      }).select('name sku category');

      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${product.productId} not found or not available.`,
        });
      }

      productValidation.push({
        productId: product.productId,
        productName: productExists.name,
        quantity: parseInt(product.quantity),
        notes: product.notes || '',
      });
    }

    // Create enquiry
    const enquiryData = {
      customerName: customerName.trim(),
      company: company.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      message: message.trim(),
      products: productValidation,
      source,
      status: 'new',
    };

    // Add attachments if provided
    if (req.body.attachments && Array.isArray(req.body.attachments)) {
      enquiryData.attachments = req.body.attachments.filter(
        att => att && att.trim(),
      );
    }

    const enquiry = await Enquiry.create(enquiryData);

    // Populate product details for response
    const populatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate(
        'products.productId',
        'name sku category images.main pricing.basePrice',
      )
      .lean();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. We will contact you soon.',
      data: {
        enquiry: {
          enquiryNo: populatedEnquiry.enquiryNo,
          customerName: populatedEnquiry.customerName,
          company: populatedEnquiry.company,
          email: populatedEnquiry.email,
          status: populatedEnquiry.status,
          products: populatedEnquiry.products,
          totalQuantity: populatedEnquiry.totalQuantity,
          createdAt: populatedEnquiry.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Create enquiry error:', error);

    // Handle duplicate email in short time frame
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          'An enquiry from this email already exists. Please wait before submitting another enquiry.',
      });
    }

    // Handle validation errors
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
      message: 'Internal server error while creating enquiry.',
    });
  }
};

/**
 * Get enquiry status by enquiry number (public)
 */
const getEnquiryStatus = async (req, res) => {
  try {
    const { enquiryNo } = req.params;
    const { email } = req.query;

    if (!enquiryNo || !email) {
      return res.status(400).json({
        success: false,
        message: 'Enquiry number and email are required.',
      });
    }

    const enquiry = await Enquiry.findOne({
      enquiryNo,
      email: email.toLowerCase().trim(),
    })
      .select(
        'enquiryNo customerName company status createdAt products.productName products.quantity',
      )
      .lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found or email does not match.',
      });
    }

    // Map status to user-friendly messages
    const statusMessages = {
      new: 'We have received your enquiry and will review it shortly.',
      in_review: 'Your enquiry is being reviewed by our team.',
      approved:
        'Your enquiry has been approved. A quotation will be sent to you.',
      rejected: 'Your enquiry could not be processed at this time.',
    };

    res.json({
      success: true,
      message: 'Enquiry status retrieved successfully.',
      data: {
        enquiry: {
          enquiryNo: enquiry.enquiryNo,
          customerName: enquiry.customerName,
          company: enquiry.company,
          status: enquiry.status,
          statusMessage: statusMessages[enquiry.status],
          submittedAt: enquiry.createdAt,
          productCount: enquiry.products.length,
          totalQuantity: enquiry.products.reduce(
            (sum, p) => sum + p.quantity,
            0,
          ),
        },
      },
    });
  } catch (error) {
    console.error('Get enquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving enquiry status.',
    });
  }
};

/**
 * Subscribe to newsletter/updates
 */
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for subscription.',
      });
    }

    // Basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // In a real application, you would save this to a Newsletter/Subscription model
    // For now, we'll just return a success response

    res.json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during newsletter subscription.',
    });
  }
};

/**
 * Contact form submission
 */
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, subject, message) are required.',
      });
    }

    // Create a general enquiry for contact form submissions
    const enquiryData = {
      customerName: name.trim(),
      company: 'N/A', // Default for contact form
      email: email.toLowerCase().trim(),
      phone: 'N/A', // Default for contact form
      message: `Subject: ${subject.trim()}\n\n${message.trim()}`,
      products: [], // No products for general contact
      source: 'contact_form',
      status: 'new',
    };

    const enquiry = await Enquiry.create(enquiryData);

    res.json({
      success: true,
      message:
        'Your message has been sent successfully. We will get back to you soon.',
      data: {
        enquiryNo: enquiry.enquiryNo,
      },
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while submitting contact form.',
    });
  }
};

module.exports = {
  createEnquiry,
  getEnquiryStatus,
  subscribeNewsletter,
  submitContactForm,
};
