/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

// Define the User schema
const UserSchema = new Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Role-based access control
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
      index: true,
    },

    // Account status
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },

    // Additional user details
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },

    // Security and session management
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Password reset functionality
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },

    // Preferences
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        browser: {
          type: Boolean,
          default: true,
        },
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de'],
      },
    },

    // Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ lastLogin: -1 });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full role permissions
UserSchema.virtual('permissions').get(function () {
  const rolePermissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
    editor: ['read', 'write'],
    viewer: ['read'],
  };
  return rolePermissions[this.role] || [];
});

// Virtual for display name
UserSchema.virtual('displayName').get(function () {
  return this.name || this.email;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to track updates
UserSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

// Instance method to check password
UserSchema.methods.checkPassword = async function (candidatePassword) {
  if (!candidatePassword || !this.passwordHash) return false;
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Instance method to set password
UserSchema.methods.setPassword = async function (password) {
  if (!password) {
    throw new Error('Password is required');
  }

  try {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

// Instance method to increment login attempts
UserSchema.methods.incLoginAttempts = function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

// Instance method to check if user has permission
UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

// Instance method to check if user has any of the given roles
UserSchema.methods.hasRole = function (roles) {
  if (typeof roles === 'string') roles = [roles];
  return roles.includes(this.role);
};

// Instance method to generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to generate email verification token
UserSchema.methods.createEmailVerificationToken = function () {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Static method to find by email
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
UserSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};

// Static method to find by role
UserSchema.statics.findByRole = function (role) {
  return this.find({ role, status: 'active' });
};

// Static method to create admin user (for seeding)
UserSchema.statics.createAdmin = async function (userData) {
  const existingAdmin = await this.findOne({ role: 'admin' });
  if (existingAdmin) {
    throw new Error('Admin user already exists');
  }

  const adminData = {
    ...userData,
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
  };

  return this.create(adminData);
};

module.exports = mongoose.model('TexxolutionUser', UserSchema);
