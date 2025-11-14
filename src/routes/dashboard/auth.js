/**
 * 🔐 Dashboard Authentication Routes
 * JWT-based authentication system for admin dashboard access.
 * Routes: POST /login, POST /refresh-token, GET /profile, POST /logout
 * Handles user login, token refresh, profile management with role-based access control.
 */

const express = require('express');
const {
  requireAuth,
  validateRefreshToken,
  authRateLimit,
} = require('../../middleware/auth');
const {
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require('../../controllers/authController');

const router = express.Router();

// Apply rate limiting to authentication routes
router.use(authRateLimit(5, 15 * 60 * 1000)); // 5 attempts per 15 minutes

// Public routes (no authentication required)
router.post('/login', login);
router.post('/refresh-token', validateRefreshToken, refreshToken);

// Protected routes (authentication required)
router.use(requireAuth); // Apply requireAuth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

module.exports = router;
