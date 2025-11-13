# Product Image Upload Guide

This guide explains **2 approaches** for uploading images when creating products in Shop Texxolution.

## **Approach 1: Upload Images Separately (2-Step Process)**

### Step 1: Create Product (JSON Only)

```bash
POST /api/dashboard/products
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "sku": "TEX001",
  "name": "Premium Cotton Fabric",
  "category": "Cotton",
  "description": "High-quality cotton fabric for premium applications",
  "composition": "100% Cotton",
  "color": "White",
  "width": "60 inches",
  "gsm": 150,
  "finish": "Plain",
  "application": "Clothing",
  "moq": 100,
  "leadTime": "7-10 days",
  "tags": ["cotton", "premium", "white"],
  "status": "draft",
  "categoryData": {
    "organicCertified": true,
    "shrinkage": "3%",
    "washCare": "Machine wash cold"
  },
  "pricing": {
    "basePrice": 25.5,
    "currency": "USD"
  },
  "inventory": {
    "inStock": 500,
    "trackInventory": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "name": "Premium Cotton Fabric",
      "images": {
        "main": "",
        "gallery": []
      }
      // ... other product fields
    }
  }
}
```

### Step 2: Upload Images to the Product

```bash
POST /api/dashboard/uploads/products/674b123456789abc12345678/images
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

**Form Data:**

```javascript
const formData = new FormData();
formData.append("images", mainImageFile); // First image becomes main
formData.append("images", galleryImage1);
formData.append("images", galleryImage2);
formData.append("imageType", "gallery"); // or 'main'

fetch("/api/dashboard/uploads/products/674b123456789abc12345678/images", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully.",
  "data": {
    "uploadedImages": [
      "https://your-r2-domain.com/products/TEX001/images/image_1703123456000_0.jpg",
      "https://your-r2-domain.com/products/TEX001/images/image_1703123456001_1.jpg",
      "https://your-r2-domain.com/products/TEX001/images/image_1703123456002_2.jpg"
    ],
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "name": "Premium Cotton Fabric",
      "images": {
        "main": "https://your-r2-domain.com/products/TEX001/images/image_1703123456000_0.jpg",
        "gallery": [
          "https://your-r2-domain.com/products/TEX001/images/image_1703123456001_1.jpg",
          "https://your-r2-domain.com/products/TEX001/images/image_1703123456002_2.jpg"
        ]
      }
    }
  }
}
```

---

## **Approach 2: Upload Images During Product Creation (1-Step Process)**

### Create Product with Images Simultaneously

```bash
POST /api/dashboard/products/with-images
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

**Form Data Structure:**

```javascript
const formData = new FormData();

// Product data as JSON string
const productData = {
  sku: "TEX002",
  name: "Premium Silk Fabric",
  category: "Silk",
  description: "Luxurious silk fabric",
  composition: "100% Silk",
  color: "Ivory",
  width: "45 inches",
  gsm: 80,
  finish: "Satin",
  application: "Formal wear",
  moq: 50,
  leadTime: "10-14 days",
  tags: ["silk", "luxury", "ivory"],
  status: "active",
  categoryData: {
    weaveType: "Plain",
    threadCount: "400TC",
    careInstructions: "Dry clean only",
  },
  pricing: {
    basePrice: 85.0,
    currency: "USD",
  },
  inventory: {
    inStock: 200,
    trackInventory: true,
  },
};

// Add product data as JSON string
formData.append("productData", JSON.stringify(productData));

// Add files
formData.append("mainImage", mainImageFile); // Single main image
formData.append("galleryImages", galleryImage1); // Multiple gallery images
formData.append("galleryImages", galleryImage2);
formData.append("galleryImages", galleryImage3);
formData.append("specSheet", specSheetPDF); // Optional spec sheet

// Send request
fetch("/api/dashboard/products/with-images", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "message": "Product created successfully with files.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345679",
      "sku": "TEX002",
      "name": "Premium Silk Fabric",
      "images": {
        "main": "https://your-r2-domain.com/products/TEX002/images/main_1703123456000.jpg",
        "gallery": [
          "https://your-r2-domain.com/products/TEX002/images/image_1703123456001_0.jpg",
          "https://your-r2-domain.com/products/TEX002/images/image_1703123456002_1.jpg",
          "https://your-r2-domain.com/products/TEX002/images/image_1703123456003_2.jpg"
        ]
      },
      "specSheet": "https://your-r2-domain.com/products/TEX002/files/spec_TEX002_1703123456000.pdf"
      // ... other product fields
    },
    "uploadedFiles": {
      "mainImage": "https://your-r2-domain.com/products/TEX002/images/main_1703123456000.jpg",
      "galleryImages": [
        "https://your-r2-domain.com/products/TEX002/images/image_1703123456001_0.jpg",
        "https://your-r2-domain.com/products/TEX002/images/image_1703123456002_1.jpg",
        "https://your-r2-domain.com/products/TEX002/images/image_1703123456003_2.jpg"
      ],
      "specSheet": "https://your-r2-domain.com/products/TEX002/files/spec_TEX002_1703123456000.pdf"
    }
  }
}
```

---

## **Frontend Implementation Examples**

### React Component for Approach 1 (Separate Upload)

```jsx
import React, { useState } from "react";

const CreateProduct = () => {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);

  // Step 1: Create product
  const createProduct = async (productData) => {
    const response = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const result = await response.json();
    if (result.success) {
      setProduct(result.data.product);
      return result.data.product;
    }
  };

  // Step 2: Upload images
  const uploadImages = async (productId, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));
    formData.append("imageType", "gallery");

    const response = await fetch(
      `/api/dashboard/uploads/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    return response.json();
  };

  const handleSubmit = async (formData, imageFiles) => {
    try {
      // Create product first
      const createdProduct = await createProduct(formData);

      // Then upload images if any
      if (imageFiles.length > 0) {
        await uploadImages(createdProduct._id, imageFiles);
      }

      console.log("Product created successfully!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(productFormData, images);
      }}
    >
      {/* Form fields... */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(Array.from(e.target.files))}
      />
      <button type="submit">Create Product</button>
    </form>
  );
};
```

### React Component for Approach 2 (Single Upload)

```jsx
import React, { useState } from "react";

const CreateProductWithImages = () => {
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [specSheet, setSpecSheet] = useState(null);

  const handleSubmit = async (productData) => {
    try {
      const formData = new FormData();

      // Add product data as JSON
      formData.append("productData", JSON.stringify(productData));

      // Add files
      if (mainImage) formData.append("mainImage", mainImage);
      galleryImages.forEach((file) => formData.append("galleryImages", file));
      if (specSheet) formData.append("specSheet", specSheet);

      const response = await fetch("/api/dashboard/products/with-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        console.log("Product created with images!", result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(productFormData);
      }}
    >
      {/* Product form fields... */}

      <div>
        <label>Main Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files[0])}
        />
      </div>

      <div>
        <label>Gallery Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setGalleryImages(Array.from(e.target.files))}
        />
      </div>

      <div>
        <label>Spec Sheet:</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setSpecSheet(e.target.files[0])}
        />
      </div>

      <button type="submit">Create Product with Images</button>
    </form>
  );
};
```

---

## **Which Approach to Use?**

### **Use Approach 1 (Separate Upload) When:**

- ✅ You want to create products first, then add images later
- ✅ You need to manage images separately from product creation
- ✅ You want to give users the ability to add/remove images after product creation
- ✅ You're building a multi-step product creation wizard

### **Use Approach 2 (Single Upload) When:**

- ✅ You want a single-step product creation process
- ✅ You always require images during product creation
- ✅ You want to minimize API calls and complexity
- ✅ You're building a simple form where everything is submitted at once

## **File Specifications**

### **Supported Image Formats:**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### **File Size Limits:**

- Images: 5MB per file
- Spec sheets: 10MB per file

### **Upload Limits:**

- Main image: 1 file
- Gallery images: Up to 9 files
- Total files per request: 10 files

### **File Organization in R2:**

```
bucket/
└── products/
    └── {product-sku}/
        ├── images/
        │   ├── main_{timestamp}.{ext}
        │   └── image_{timestamp}_{index}.{ext}
        └── files/
            └── spec_{sku}_{timestamp}.pdf
```

## **Error Handling**

Both approaches include comprehensive error handling:

- File validation (type, size)
- Product validation
- Authentication checks
- Automatic cleanup of temporary files
- Graceful failure handling

Choose the approach that best fits your frontend architecture and user experience requirements!
