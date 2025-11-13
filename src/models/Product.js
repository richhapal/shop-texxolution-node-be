const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Product schema
const ProductSchema = new Schema(
  {
    // Shared base fields
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Yarn",
        "Garments",
        "Denim",
        "Greige Fabric",
        "Packing",
        "Machineries & Equipment",
        "Home Decoration",
        "Textile Farming",
        "Fibre",
        "Fabric (Finished)",
        "Finished Fabrics",
        "Trims & Accessories",
        "Dyes & Chemicals",
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: {
      main: {
        type: String,
        required: true,
        trim: true,
      },
      gallery: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    composition: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    width: {
      type: String,
      required: true,
      trim: true,
    },
    gsm: {
      type: Number,
      required: true,
      min: 0,
    },
    finish: {
      type: String,
      required: true,
      trim: true,
    },
    application: {
      type: String,
      required: true,
      trim: true,
    },
    moq: {
      type: Number,
      required: true,
      min: 1,
    },
    leadTime: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    specSheet: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "discontinued"],
      default: "draft",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Category-specific data stored as a flexible JSON object
    categoryData: {
      type: Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function (data) {
          // Validate category-specific fields based on the product category
          const category = this.category;

          if (!category || !data) return true;

          // Define validation rules for each category
          const categoryValidations = {
            Yarn: {
              allowedFields: ["type", "count", "ply", "twist", "packaging"],
              requiredFields: [],
            },
            Garments: {
              allowedFields: [
                "productType",
                "fabricComposition",
                "gsm",
                "fit",
                "sizes",
                "season",
              ],
              requiredFields: [],
            },
            Denim: {
              allowedFields: ["shade", "stretchPercent", "weave"],
              requiredFields: [],
            },
            "Greige Fabric": {
              allowedFields: [
                "construction",
                "weave",
                "rollLength",
                "readyForDyeing",
              ],
              requiredFields: [],
            },
            Packing: {
              allowedFields: ["type", "material", "dimensions", "recyclable"],
              requiredFields: [],
            },
            "Machineries & Equipment": {
              allowedFields: [
                "machineType",
                "modelNo",
                "brand",
                "capacity",
                "power",
                "usage",
              ],
              requiredFields: [],
            },
            "Home Decoration": {
              allowedFields: [
                "productType",
                "fabricType",
                "designPattern",
                "size",
                "usage",
                "colorOptions",
              ],
              requiredFields: [],
            },
            "Textile Farming": {
              allowedFields: [
                "productType",
                "grade",
                "moisturePercent",
                "fibreLength",
                "region",
                "harvestSeason",
              ],
              requiredFields: [],
            },
            Fibre: {
              allowedFields: [
                "fibreType",
                "denier",
                "length",
                "luster",
                "packaging",
              ],
              requiredFields: [],
            },
            "Fabric (Finished)": {
              allowedFields: ["fabricType", "pattern", "careInstructions"],
              requiredFields: [],
            },
            "Finished Fabrics": {
              allowedFields: [
                "finishType",
                "performance",
                "pattern",
                "colorRange",
              ],
              requiredFields: [],
            },
            "Trims & Accessories": {
              allowedFields: ["type", "material", "size", "usage"],
              requiredFields: [],
            },
            "Dyes & Chemicals": {
              allowedFields: [
                "type",
                "form",
                "shade",
                "concentration",
                "packaging",
              ],
              requiredFields: [],
            },
          };

          const validation = categoryValidations[category];
          if (!validation) return true;

          // Check if all provided fields are allowed for this category
          const dataFields = Object.keys(data);
          const invalidFields = dataFields.filter(
            (field) => !validation.allowedFields.includes(field)
          );

          if (invalidFields.length > 0) {
            this.invalidate(
              "categoryData",
              `Invalid fields for category ${category}: ${invalidFields.join(
                ", "
              )}`
            );
            return false;
          }

          // Check if all required fields are present
          const missingFields = validation.requiredFields.filter(
            (field) => !dataFields.includes(field)
          );

          if (missingFields.length > 0) {
            this.invalidate(
              "categoryData",
              `Missing required fields for category ${category}: ${missingFields.join(
                ", "
              )}`
            );
            return false;
          }

          return true;
        },
        message: "Invalid category data structure",
      },
    },

    // Pricing information
    pricing: {
      basePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
        enum: ["USD", "EUR", "INR", "GBP"],
      },
      discountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // Inventory management
    inventory: {
      inStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      reserved: {
        type: Number,
        min: 0,
        default: 0,
      },
      trackInventory: {
        type: Boolean,
        default: true,
      },
    },

    // SEO and metadata
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // Vendor information
    vendor: {
      supplierId: {
        type: Schema.Types.ObjectId,
        ref: "Supplier",
      },
      supplierSku: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ "pricing.basePrice": 1 });
ProductSchema.index({ sku: 1 });

// Virtual for calculated price after discount
ProductSchema.virtual("finalPrice").get(function () {
  const discount = this.pricing.discountPercent || 0;
  const basePrice = this.pricing.basePrice || 0;
  return basePrice * (1 - discount / 100);
});

// Virtual for availability status
ProductSchema.virtual("isAvailable").get(function () {
  if (!this.inventory.trackInventory) return this.status === "active";
  return (
    this.status === "active" &&
    this.inventory.inStock - this.inventory.reserved > 0
  );
});

// Pre-save middleware to ensure categoryData structure
ProductSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("category")) {
    // Initialize categoryData if not present
    if (!this.categoryData) {
      this.categoryData = {};
    }
  }
  next();
});

// Static method to get category-specific field definitions
ProductSchema.statics.getCategoryFields = function (category) {
  const categoryFieldDefinitions = {
    Yarn: {
      type: {
        type: String,
        enum: ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Blended"],
      },
      count: { type: String },
      ply: { type: Number, min: 1 },
      twist: { type: String, enum: ["S-Twist", "Z-Twist", "No Twist"] },
      packaging: { type: String },
    },
    Garments: {
      productType: {
        type: String,
        enum: ["Shirt", "Pants", "Dress", "Jacket", "T-Shirt", "Other"],
      },
      fabricComposition: { type: String },
      gsm: { type: Number, min: 0 },
      fit: { type: String, enum: ["Slim", "Regular", "Loose", "Tailored"] },
      sizes: [
        { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] },
      ],
      season: {
        type: String,
        enum: ["Spring", "Summer", "Fall", "Winter", "All Season"],
      },
    },
    Denim: {
      shade: { type: String },
      stretchPercent: { type: Number, min: 0, max: 100 },
      weave: { type: String, enum: ["Twill", "Plain", "Broken Twill"] },
    },
    "Greige Fabric": {
      construction: { type: String },
      weave: {
        type: String,
        enum: ["Plain", "Twill", "Satin", "Oxford", "Dobby"],
      },
      rollLength: { type: Number, min: 0 },
      readyForDyeing: { type: Boolean, default: false },
    },
    Packing: {
      type: { type: String, enum: ["Box", "Bag", "Wrap", "Container"] },
      material: { type: String },
      dimensions: { type: String },
      recyclable: { type: Boolean, default: false },
    },
    "Machineries & Equipment": {
      machineType: { type: String },
      modelNo: { type: String },
      brand: { type: String },
      capacity: { type: String },
      power: { type: String },
      usage: { type: String },
    },
    "Home Decoration": {
      productType: {
        type: String,
        enum: ["Curtains", "Cushions", "Bedding", "Upholstery", "Wall Hanging"],
      },
      fabricType: { type: String },
      designPattern: { type: String },
      size: { type: String },
      usage: { type: String, enum: ["Indoor", "Outdoor", "Both"] },
      colorOptions: [{ type: String }],
    },
    "Textile Farming": {
      productType: {
        type: String,
        enum: ["Cotton", "Jute", "Hemp", "Flax", "Other"],
      },
      grade: { type: String, enum: ["A", "B", "C", "Premium"] },
      moisturePercent: { type: Number, min: 0, max: 100 },
      fibreLength: { type: Number, min: 0 },
      region: { type: String },
      harvestSeason: { type: String },
    },
    Fibre: {
      fibreType: {
        type: String,
        enum: ["Natural", "Synthetic", "Semi-Synthetic"],
      },
      denier: { type: Number, min: 0 },
      length: { type: Number, min: 0 },
      luster: { type: String, enum: ["Bright", "Semi-Dull", "Dull"] },
      packaging: { type: String },
    },
    "Fabric (Finished)": {
      fabricType: { type: String },
      pattern: { type: String },
      careInstructions: { type: String },
    },
    "Finished Fabrics": {
      finishType: { type: String },
      performance: { type: String },
      pattern: { type: String },
      colorRange: [{ type: String }],
    },
    "Trims & Accessories": {
      type: {
        type: String,
        enum: ["Button", "Zipper", "Thread", "Label", "Buckle", "Other"],
      },
      material: { type: String },
      size: { type: String },
      usage: { type: String },
    },
    "Dyes & Chemicals": {
      type: {
        type: String,
        enum: ["Reactive", "Direct", "Vat", "Acid", "Basic", "Disperse"],
      },
      form: { type: String, enum: ["Powder", "Liquid", "Granules"] },
      shade: { type: String },
      concentration: { type: String },
      packaging: { type: String },
    },
  };

  return categoryFieldDefinitions[category] || {};
};

// Instance method to validate category data
ProductSchema.methods.validateCategoryData = function () {
  const allowedFields = this.constructor.getCategoryFields(this.category);
  const errors = [];

  if (this.categoryData) {
    Object.keys(this.categoryData).forEach((field) => {
      if (!allowedFields[field]) {
        errors.push(
          `Field '${field}' is not allowed for category '${this.category}'`
        );
      }
    });
  }

  return errors;
};

module.exports = mongoose.model("Product", ProductSchema);
