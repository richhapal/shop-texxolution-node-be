/* eslint-disable consistent-return */
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

/**
 * Register a new user
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // All new signups get 'viewer' role only - admin can change role later
    const userRole = 'viewer';

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: userRole,
      status: 'active',
      isEmailVerified: true, // Set to true for direct signup, or false if you want email verification
    });

    // Set password (will be hashed by pre-save middleware)
    await newUser.setPassword(password);

    // Save user
    await newUser.save();

    // Generate tokens
    const token = generateToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);

    // Prepare user data for response
    const userData = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: userData,
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

/**
 * Login user and issue JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message:
          'Account is temporarily locked due to too many failed login attempts.',
      });
    }

    // Check if account is suspended
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.',
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Prepare user data (password already excluded by toJSON transform)
    const userData = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userData,
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res) => {
  try {
    // User is already attached to req by validateRefreshToken middleware
    const user = req.user;

    // Generate new access token
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.',
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // User is already attached to req by requireAuth middleware
    const user = req.user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving profile.',
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, preferences } = req.body;
    const userId = req.user._id;

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (preferences)
      updateData.preferences = { ...req.user.preferences, ...preferences };

    updateData.updatedBy = userId;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile.',
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Current password, new password, and confirmation are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Get user with password
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    user.updatedBy = userId;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password.',
    });
  }
};

/**
 * Logout user (invalidate token)
 * Note: In a production app, you might want to maintain a blacklist of invalid tokens
 */
const logout = async (req, res) => {
  try {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store blacklisted tokens in Redis with TTL
    // 3. Check blacklist in requireAuth middleware

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.',
    });
  }
};

/**
 * Assign role to user (Admin only)
 */
const assignRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validation
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required.',
      });
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided email.',
      });
    }

    // Check if user is trying to change their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
      });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Cannot remove the last admin user.',
        });
      }
    }

    // Update user role
    const previousRole = user.role;
    user.role = role;
    user.updatedBy = req.user._id;
    await user.save();

    // Prepare user data for response
    const userData = user.toJSON();

    res.json({
      success: true,
      message: `User role updated successfully from '${previousRole}' to '${role}'.`,
      data: {
        user: userData,
        previousRole,
        newRole: role,
        updatedBy: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error('Role assignment error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error during role assignment.',
    });
  }
};

/**
 * Admin change user password (Admin only)
 */
const adminChangePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided email.',
      });
    }

    // Prevent admin from changing their own password through this endpoint
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          'Use the regular change-password endpoint to change your own password.',
      });
    }

    // Only allow changing password for editor and viewer roles (not other admins)
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change password for other admin users.',
      });
    }

    // Update user password
    await user.setPassword(newPassword);
    user.updatedBy = req.user._id;
    await user.save();

    // Reset login attempts if any
    await user.resetLoginAttempts();

    res.json({
      success: true,
      message: `Password updated successfully for user: ${user.email}`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        updatedBy: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        passwordChanged: true,
      },
    });
  } catch (error) {
    console.error('Admin password change error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error during password change.',
    });
  }
};

/**
 * Get all users with pagination (Admin only)
 * @desc    Get all users with search and filtering
 * @route   GET /api/dashboard/auth/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role && ['admin', 'editor', 'viewer'].includes(role)) {
      filter.role = role;
    }

    // Status filter
    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    // Build sort object
    const sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortObj[field.slice(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Validate pagination parameters
    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1-100.',
      });
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken') // Exclude sensitive fields
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);

    // Build response
    res.json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalUsers: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
          resultsOnPage: users.length,
        },
        filters: {
          search: search || null,
          role: role || null,
          status: status || null,
          sort: sort || '-createdAt',
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving users.',
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  assignRole,
  adminChangePassword,
  getAllUsers,
};
