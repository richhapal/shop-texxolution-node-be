const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Quotation schema
const QuotationSchema = new Schema(
  {
    // Reference to enquiry
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: true,
      index: true,
    },

    // Quotation identification
    quotationNo: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Customer information (copied from enquiry for easy access)
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
        "Please enter a valid email address",
      ],
    },

    // Product quotation details
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
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
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        deliveryTime: {
          type: String,
          required: true,
          trim: true,
        },
        discount: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },
    ],

    // Quotation validity and terms
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    terms: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    // Document management
    pdfLink: {
      type: String,
      trim: true,
    },

    // Status management
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined", "expired"],
      default: "draft",
      index: true,
    },

    // Creator information
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Additional quotation details
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "EUR", "INR", "GBP"],
    },

    // Tax and shipping
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    shippingMethod: {
      type: String,
      trim: true,
    },

    // Payment terms
    paymentTerms: {
      type: String,
      enum: [
        "advance",
        "30_days",
        "60_days",
        "90_days",
        "on_delivery",
        "custom",
      ],
      default: "30_days",
    },
    customPaymentTerms: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Revision tracking
    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
    previousRevisions: [
      {
        revisionNo: Number,
        modifiedAt: Date,
        modifiedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        changes: String,
      },
    ],

    // Communication tracking
    sentAt: {
      type: Date,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    viewedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    declinedAt: {
      type: Date,
    },
    declineReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Follow-up tracking
    followUpDate: {
      type: Date,
    },

    // Internal notes
    internalNotes: [
      {
        note: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
QuotationSchema.index({ enquiryId: 1 });
QuotationSchema.index({ status: 1, createdAt: -1 });
QuotationSchema.index({ createdBy: 1 });
QuotationSchema.index({ validUntil: 1 });
QuotationSchema.index({ email: 1 });
QuotationSchema.index({ quotationNo: 1 });
QuotationSchema.index({ company: 1 });

// Virtual for subtotal (before tax and shipping)
QuotationSchema.virtual("subtotal").get(function () {
  return this.products.reduce((total, product) => {
    const discountedPrice =
      product.unitPrice * (1 - (product.discount || 0) / 100);
    return total + discountedPrice * product.quantity;
  }, 0);
});

// Virtual for tax amount
QuotationSchema.virtual("taxAmount").get(function () {
  return (this.subtotal * (this.taxRate || 0)) / 100;
});

// Virtual for total amount
QuotationSchema.virtual("totalAmount").get(function () {
  return this.subtotal + this.taxAmount + (this.shippingCost || 0);
});

// Virtual for days until expiry
QuotationSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.validUntil) return null;
  const now = new Date();
  const expiry = this.validUntil;
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expired status
QuotationSchema.virtual("isExpired").get(function () {
  if (!this.validUntil) return false;
  return new Date() > this.validUntil && this.status === "sent";
});

// Virtual for response time (how long customer took to respond)
QuotationSchema.virtual("responseTime").get(function () {
  if (!this.sentAt || (!this.acceptedAt && !this.declinedAt)) return null;
  const responseDate = this.acceptedAt || this.declinedAt;
  const diffTime = responseDate - this.sentAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate quotation number
QuotationSchema.pre("save", async function (next) {
  if (this.isNew && !this.quotationNo) {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    // Find the last quotation number for this month
    const lastQuotation = await this.constructor
      .findOne({
        quotationNo: new RegExp(`^QUO${year}${month}`),
      })
      .sort({ quotationNo: -1 });

    let sequence = 1;
    if (lastQuotation && lastQuotation.quotationNo) {
      const lastSequence = parseInt(lastQuotation.quotationNo.substr(-4));
      sequence = lastSequence + 1;
    }

    this.quotationNo = `QUO${year}${month}${sequence
      .toString()
      .padStart(4, "0")}`;
  }

  // Auto-expire quotations that are past their validity date
  if (
    this.validUntil &&
    new Date() > this.validUntil &&
    this.status === "sent"
  ) {
    this.status = "expired";
  }

  next();
});

// Pre-save middleware to track revisions
QuotationSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("products")) {
    this.previousRevisions.push({
      revisionNo: this.revision,
      modifiedAt: new Date(),
      modifiedBy: this.modifiedBy, // This should be set by the controller
      changes: "Products modified",
    });
    this.revision += 1;
  }
  next();
});

// Static method to get quotations by status
QuotationSchema.statics.getByStatus = function (status, limit = 50) {
  return this.find({ status })
    .populate("enquiryId", "enquiryNo customerName")
    .populate("products.productId", "name sku category")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get expired quotations
QuotationSchema.statics.getExpired = function () {
  return this.find({
    validUntil: { $lt: new Date() },
    status: "sent",
  })
    .populate("createdBy", "name email")
    .sort({ validUntil: 1 });
};

// Static method to get quotations requiring follow-up
QuotationSchema.statics.getRequiringFollowUp = function () {
  return this.find({
    followUpDate: { $lt: new Date() },
    status: "sent",
  })
    .populate("createdBy", "name email")
    .sort({ followUpDate: 1 });
};

// Instance method to send quotation
QuotationSchema.methods.markAsSent = function (userId) {
  this.status = "sent";
  this.sentAt = new Date();
  this.sentBy = userId;
  return this.save();
};

// Instance method to accept quotation
QuotationSchema.methods.accept = function () {
  this.status = "accepted";
  this.acceptedAt = new Date();
  return this.save();
};

// Instance method to decline quotation
QuotationSchema.methods.decline = function (reason) {
  this.status = "declined";
  this.declinedAt = new Date();
  this.declineReason = reason;
  return this.save();
};

// Instance method to add internal note
QuotationSchema.methods.addInternalNote = function (note, userId) {
  this.internalNotes.push({
    note: note,
    addedBy: userId,
  });
  return this.save();
};

// Instance method to create revision
QuotationSchema.methods.createRevision = function (changes, userId) {
  this.previousRevisions.push({
    revisionNo: this.revision,
    modifiedAt: new Date(),
    modifiedBy: userId,
    changes: changes,
  });
  this.revision += 1;
  this.status = "draft"; // Reset to draft for review
  return this.save();
};

module.exports = mongoose.model("TexxolutionQuotation", QuotationSchema);
