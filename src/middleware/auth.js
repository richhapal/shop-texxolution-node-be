const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  const payload = {
    userId,
    role,
    iat: Date.now(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "shop-texxolution",
    audience: "shop-texxolution-users",
  });
};

/**
 * Generate refresh token for user
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: "refresh",
    iat: Date.now(),
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    }
  );
};

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to req.user
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token starts with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId).select("-passwordHash");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not found.",
        });
      }

      // Check if user account is active
      if (user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Account is suspended.",
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Account is temporarily locked.",
        });
      }

      // Attach user to request object
      req.user = user;
      req.token = token;

      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Token has expired.",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token.",
        });
      }

      throw jwtError;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // requireAuth should be called before this middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check specific permissions
 * @param {...string} permissions - Required permissions
 * @returns {Function} Middleware function
 */
const requirePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Check if user has all required permissions
    const hasAllPermissions = permissions.every((permission) =>
      req.user.hasPermission(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${permissions.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to req.user if valid token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token provided, continue without user
    }

    const token = authHeader.slice(7);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-passwordHash");

      if (user && user.status === "active" && !user.isLocked) {
        req.user = user;
        req.token = token;
      }
    } catch (jwtError) {
      // Invalid token, but don't throw error - just continue without user
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next(); // Continue without authentication on error
  }
};

/**
 * Middleware to validate refresh token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token or user not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token.",
    });
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean up old entries
    for (const [ip, data] of attempts.entries()) {
      if (now - data.resetTime > windowMs) {
        attempts.delete(ip);
      }
    }

    const userAttempts = attempts.get(key) || { count: 0, resetTime: now };

    if (now - userAttempts.resetTime > windowMs) {
      userAttempts.count = 0;
      userAttempts.resetTime = now;
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: "Too many authentication attempts. Please try again later.",
      });
    }

    userAttempts.count += 1;
    attempts.set(key, userAttempts);

    next();
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  requireAuth,
  restrictTo,
  requirePermissions,
  optionalAuth,
  validateRefreshToken,
  authRateLimit,
};
