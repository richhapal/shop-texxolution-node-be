const {
  uploadToR2,
  uploadMultipleImages,
  deleteFromR2,
  validateFile,
} = require("../utils/cloudflareR2");
const Product = require("../models/Product");

/**
 * Upload product images to Cloudflare R2
 */
const uploadProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageType = "gallery" } = req.body; // 'main' or 'gallery'

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required.",
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Validate all files
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of req.files) {
      const validation = validateFile(file, allowedImageTypes, maxSize);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "File validation failed.",
          errors: validation.errors,
        });
      }
    }

    // Upload images to R2
    const folderPath = `products/${product.sku}/images`;
    const metadata = {
      "product-id": product._id.toString(),
      "product-sku": product.sku,
      "uploaded-by": req.user._id.toString(),
      "image-type": imageType,
    };

    const uploadResults = await uploadMultipleImages(
      req.files,
      folderPath,
      metadata
    );

    // Update product with image URLs
    const imageUrls = uploadResults.map((result) => result.publicUrl);

    if (imageType === "main" && imageUrls.length > 0) {
      // Update main image (use first uploaded image)
      product.images.main = imageUrls[0];
    } else {
      // Add to gallery images
      product.images.gallery = [
        ...(product.images.gallery || []),
        ...imageUrls,
      ];
    }

    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: `${imageUrls.length} image(s) uploaded successfully.`,
      data: {
        uploadedImages: imageUrls,
        product: {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          images: product.images,
        },
      },
    });
  } catch (error) {
    console.error("Upload product images error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading images.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete product image from R2 and update product
 */
const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageUrl } = req.params;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Extract filename from URL
    const url = decodeURIComponent(imageUrl);
    const fileName = url.replace(
      `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/`,
      ""
    );

    // Delete from R2
    await deleteFromR2(fileName);

    // Remove from product images
    if (product.images.main === url) {
      product.images.main = "";
    }

    if (product.images.gallery) {
      product.images.gallery = product.images.gallery.filter(
        (img) => img !== url
      );
    }

    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: "Image deleted successfully.",
      data: {
        deletedImageUrl: url,
        product: {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          images: product.images,
        },
      },
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting image.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Upload general files (spec sheets, etc.)
 */
const uploadProductFiles = async (req, res) => {
  try {
    const { productId } = req.params;
    const { fileType = "spec" } = req.body; // 'spec' for spec sheets

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required.",
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Validate file type based on fileType
    let allowedTypes = [];
    let maxSize = 10 * 1024 * 1024; // 10MB default

    switch (fileType) {
      case "spec":
        allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        break;
      default:
        allowedTypes = ["application/pdf"];
    }

    const validation = validateFile(req.file, allowedTypes, maxSize);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "File validation failed.",
        errors: validation.errors,
      });
    }

    // Generate filename
    const folderPath = `products/${product.sku}/files`;
    const fileName = `${folderPath}/${fileType}_${
      product.sku
    }_${Date.now()}.${req.file.originalname.split(".").pop()}`;

    // Upload to R2
    const uploadResult = await uploadFileFromPath(
      req.file.path,
      fileName,
      req.file.mimetype,
      {
        "product-id": product._id.toString(),
        "product-sku": product.sku,
        "uploaded-by": req.user._id.toString(),
        "file-type": fileType,
      }
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload file to R2.",
      });
    }

    // Update product with file URL
    if (fileType === "spec") {
      product.specSheet = uploadResult.publicUrl;
    }

    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: `${fileType} file uploaded successfully.`,
      data: {
        fileUrl: uploadResult.publicUrl,
        fileName: uploadResult.fileName,
        product: {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          specSheet: product.specSheet,
        },
      },
    });
  } catch (error) {
    console.error("Upload product file error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading file.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  uploadProductImages,
  deleteProductImage,
  uploadProductFiles,
};
