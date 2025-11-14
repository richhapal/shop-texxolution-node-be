const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configure Cloudflare R2 S3 Client
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' as region
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to Cloudflare R2
 * @param {Object} fileData - File information
 * @param {Buffer} fileData.buffer - File buffer
 * @param {string} fileData.originalname - Original filename
 * @param {string} fileData.mimetype - File MIME type
 * @param {string} folderPath - Folder path in R2
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Upload result with public URL
 */
const uploadToR2 = async (fileData, folderPath, metadata = {}) => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(fileData.originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const fileName = `${folderPath}/${uniqueId}${fileExtension}`;

    // Prepare upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: fileData.buffer,
      ContentType: fileData.mimetype,
      Metadata: {
        'original-name': fileData.originalname,
        'upload-date': new Date().toISOString(),
        ...metadata,
      },
    });

    // Execute upload
    const result = await r2Client.send(uploadCommand);

    // Construct public URL
    const publicUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

    return {
      success: true,
      fileName,
      publicUrl,
      etag: result.ETag,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error(`Failed to upload to R2: ${error.message}`);
  }
};

/**
 * Upload file from local path to R2
 * @param {string} filePath - Local file path
 * @param {string} fileName - Desired file name/path in R2
 * @param {string} contentType - File content type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Upload result with public URL
 */
const uploadFileFromPath = async (
  filePath,
  fileName,
  contentType,
  metadata = {},
) => {
  try {
    // Read file from local path
    const fileBuffer = fs.readFileSync(filePath);

    // Prepare upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        'upload-date': new Date().toISOString(),
        ...metadata,
      },
    });

    // Execute upload
    const result = await r2Client.send(uploadCommand);

    // Construct public URL
    const publicUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

    // Clean up temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp file:', cleanupError);
    }

    return {
      success: true,
      fileName,
      publicUrl,
      etag: result.ETag,
    };
  } catch (error) {
    // Clean up temporary file on error
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }

    console.error('R2 upload from path error:', error);
    throw new Error(`Failed to upload to R2: ${error.message}`);
  }
};

/**
 * Upload multiple images to R2
 * @param {Array} files - Array of file objects from multer
 * @param {string} folderPath - Folder path in R2
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (files, folderPath, metadata = {}) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folderPath}/image_${timestamp}_${index}${fileExtension}`;

      const result = await uploadFileFromPath(
        file.path,
        fileName,
        file.mimetype,
        metadata,
      );

      return result;
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Upload multiple images error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete file from R2
 * @param {string} fileName - The file name/path in R2
 * @returns {Promise<boolean>} Success status
 */
const deleteFromR2 = async fileName => {
  try {
    const deleteParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await r2Client.send(command);

    console.log(`File deleted successfully: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Delete from R2 error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Generate signed URL for private file access (if needed)
 * @param {string} fileName - File name/key in R2
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Signed URL
 */
const generateSignedUrl = async (fileName, expiresIn = 3600) => {
  try {
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Validate file type and size
 * @param {Object} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
const validateFile = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  const errors = [];

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  uploadToR2,
  uploadFileFromPath,
  deleteFromR2,
  uploadMultipleImages,
  generateSignedUrl,
  validateFile,
  r2Client,
};
