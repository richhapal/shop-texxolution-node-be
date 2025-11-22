/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Enquiry schema
const EnquirySchema = new Schema(
  {
    // Customer information
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Product enquiry details
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },
    ],

    // File attachments
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],

    // Status management
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'approved', 'rejected', 'closed'],
      default: 'new',
      index: true,
    },

    // Assignment and tracking
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Additional metadata
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // Source tracking
    source: {
      type: String,
      enum: ['website', 'email', 'phone', 'referral', 'trade_show', 'other'],
      default: 'website',
    },

    // Follow-up tracking
    followUpDate: {
      type: Date,
    },

    // Internal notes for staff
    internalNotes: [
      {
        note: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Communication history
    communications: [
      {
        type: {
          type: String,
          enum: ['email', 'phone', 'meeting', 'other'],
          required: true,
        },
        subject: {
          type: String,
          required: true,
          maxlength: 200,
        },
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        direction: {
          type: String,
          enum: ['inbound', 'outbound'],
          required: true,
        },
        handledBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        communicatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Activity tracking for quotation workflow
    activities: [
      {
        type: {
          type: String,
          enum: [
            'quotation_created',
            'quotation_sent',
            'quotation_accepted',
            'quotation_rejected',
            'status_updated',
            'other',
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
          maxlength: 500,
        },
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          quotationId: {
            type: Schema.Types.ObjectId,
            ref: 'Quotation',
          },
          quotationNo: String,
          oldStatus: String,
          newStatus: String,
        },
      },
    ],

    // Reference number for tracking
    enquiryNo: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ assignedTo: 1, status: 1 });
EnquirySchema.index({ company: 1 });
EnquirySchema.index({ followUpDate: 1 });
EnquirySchema.index({ enquiryNo: 1 });

// Virtual for total quantity across all products
EnquirySchema.virtual('totalQuantity').get(function () {
  return this.products.reduce((total, product) => total + product.quantity, 0);
});

// Virtual for days since enquiry
EnquirySchema.virtual('daysSinceEnquiry').get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
EnquirySchema.virtual('isOverdue').get(function () {
  if (!this.followUpDate) return false;
  return new Date() > this.followUpDate && this.status === 'in_review';
});

// Pre-save middleware to generate enquiry number
EnquirySchema.pre('save', async function (next) {
  if (this.isNew && !this.enquiryNo) {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Find the last enquiry number for this month
    const lastEnquiry = await this.constructor
      .findOne({
        enquiryNo: new RegExp(`^ENQ${year}${month}`),
      })
      .sort({ enquiryNo: -1 });

    let sequence = 1;
    if (lastEnquiry && lastEnquiry.enquiryNo) {
      const lastSequence = parseInt(lastEnquiry.enquiryNo.substr(-4));
      sequence = lastSequence + 1;
    }

    this.enquiryNo = `ENQ${year}${month}${sequence
      .toString()
      .padStart(4, '0')}`;
  }
  next();
});

// Static method to get enquiries by status
EnquirySchema.statics.getByStatus = function (status, limit = 50) {
  return this.find({ status })
    .populate('products.productId', 'name sku category')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get overdue enquiries
EnquirySchema.statics.getOverdue = function () {
  return this.find({
    followUpDate: { $lt: new Date() },
    status: 'in_review',
  })
    .populate('assignedTo', 'name email')
    .sort({ followUpDate: 1 });
};

// Instance method to add internal note
EnquirySchema.methods.addInternalNote = function (note, userId) {
  this.internalNotes.push({
    note: note,
    addedBy: userId,
  });
  return this.save();
};

// Instance method to add communication
EnquirySchema.methods.addCommunication = function (communication) {
  this.communications.push(communication);
  return this.save();
};

// Instance method to assign to user
EnquirySchema.methods.assignTo = function (userId) {
  this.assignedTo = userId;
  if (this.status === 'new') {
    this.status = 'in_review';
  }
  return this.save();
};

module.exports = mongoose.model('TexxolutionEnquiry', EnquirySchema);
