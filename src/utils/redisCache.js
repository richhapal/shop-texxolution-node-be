const { Redis } = require('@upstash/redis');

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Cache configuration
const CACHE_CONFIG = {
  PRODUCT_DETAIL_TTL: 60 * 30, // 30 minutes for individual products
};

// Cache key generators
const CACHE_KEYS = {
  PRODUCT_BY_UNIQUE_ID: uniqueId => `product:unique:${uniqueId}`,
};

class ProductCache {
  /**
   * Get cached product detail by unique ID
   */
  static async getProductByUniqueId(uniqueId) {
    try {
      const cacheKey = CACHE_KEYS.PRODUCT_BY_UNIQUE_ID(uniqueId);
      const cached = await redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get product by unique ID error:', error);
      return null;
    }
  }

  /**
   * Cache product detail by unique ID only
   */
  static async setProductDetail(product) {
    try {
      if (!product.uniqueId) {
        console.warn('Product does not have uniqueId, skipping cache');
        return;
      }

      const productData = {
        ...product,
        cachedAt: new Date(),
      };

      const jsonData = JSON.stringify(productData);
      const uniqueKey = CACHE_KEYS.PRODUCT_BY_UNIQUE_ID(product.uniqueId);
      await redis.setex(uniqueKey, CACHE_CONFIG.PRODUCT_DETAIL_TTL, jsonData);
    } catch (error) {
      console.error('Redis set product detail error:', error);
    }
  }

  /**
   * Invalidate specific product cache by unique ID only
   */
  static async invalidateProductCaches(uniqueId) {
    try {
      if (uniqueId) {
        const cacheKey = CACHE_KEYS.PRODUCT_BY_UNIQUE_ID(uniqueId);
        await redis.del(cacheKey);
      }
    } catch (error) {
      console.error('Redis invalidate product cache error:', error);
    }
  }
}

module.exports = {
  ProductCache,
  redis,
  CACHE_CONFIG,
  CACHE_KEYS,
};
