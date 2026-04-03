/**
 * Authentication Service
 * Business logic for user authentication
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { ROLES, USER_STATUS } = require('../utils/constants');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Created user and token
 */
const register = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  // If no role specified, default to viewer
  // Only admin can create users with admin or analyst roles
  const userRole = role || ROLES.VIEWER;

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    status: USER_STATUS.ACTIVE
  });

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    },
    token
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data and token
 */
const login = async (email, password) => {
  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive()) {
    throw new Error('Account is inactive. Please contact administrator.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    },
    token
  };
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success status
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Create initial admin user (for setup purposes)
 * @param {Object} adminData - Admin user data
 * @returns {Promise<Object>} - Created admin user
 */
const createInitialAdmin = async (adminData) => {
  const { name, email, password } = adminData;

  // Check if any admin exists
  const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
  if (existingAdmin) {
    throw new Error('Admin user already exists');
  }

  // Check if email is taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  });

  const token = generateToken(admin._id);

  return {
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    },
    token
  };
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  createInitialAdmin
};
