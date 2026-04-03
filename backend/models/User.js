/**
 * User Model
 * Defines the schema for user management with roles and status
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: Object.values(ROLES),
      message: 'Role must be either viewer, analyst, or admin'
    },
    default: ROLES.VIEWER
  },
  status: {
    type: String,
    enum: {
      values: Object.values(USER_STATUS),
      message: 'Status must be either active or inactive'
    },
    default: USER_STATUS.ACTIVE
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare password method
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} - True if user has the role
 */
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

/**
 * Check if user is active
 * @returns {boolean} - True if user is active
 */
userSchema.methods.isActive = function() {
  return this.status === USER_STATUS.ACTIVE;
};

/**
 * Check if user can perform action based on allowed roles
 * @param {Array} allowedRoles - Array of roles allowed for the action
 * @returns {boolean} - True if user can perform the action
 */
userSchema.methods.canPerformAction = function(allowedRoles) {
  return allowedRoles.includes(this.role) && this.isActive();
};

// Virtual for user's full info
userSchema.virtual('isAdmin').get(function() {
  return this.role === ROLES.ADMIN;
});

userSchema.virtual('isAnalyst').get(function() {
  return this.role === ROLES.ANALYST;
});

userSchema.virtual('isViewer').get(function() {
  return this.role === ROLES.VIEWER;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
