/**
 * User Service
 * Business logic for user management
 */

const User = require('../models/User');
const { ROLES, USER_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Get all users with pagination
 * @param {Object} queryParams - Query parameters (page, limit, role, status)
 * @returns {Promise<Object>} - Users list and pagination info
 */
const getAllUsers = async (queryParams = {}) => {
  const page = parseInt(queryParams.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(queryParams.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  
  if (queryParams.role && Object.values(ROLES).includes(queryParams.role)) {
    filter.role = queryParams.role;
  }
  
  if (queryParams.status && Object.values(USER_STATUS).includes(queryParams.status)) {
    filter.status = queryParams.status;
  }

  // Execute query
  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await User.countDocuments(filter);

  return {
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId) => {
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
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
const createUser = async (userData) => {
  const { name, email, password, role, status } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.VIEWER,
    status: status || USER_STATUS.ACTIVE
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  };
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if email is being changed and if it's already taken
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
  }

  // Update fields
  const allowedUpdates = ['name', 'email', 'role', 'status'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    updatedAt: user.updatedAt
  };
};

/**
 * Delete user (soft delete by setting inactive)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent deleting the last admin
  if (user.role === ROLES.ADMIN) {
    const adminCount = await User.countDocuments({ role: ROLES.ADMIN, status: USER_STATUS.ACTIVE });
    if (adminCount <= 1) {
      throw new Error('Cannot delete the last active admin');
    }
  }

  // Soft delete by setting status to inactive
  user.status = USER_STATUS.INACTIVE;
  await user.save();

  return true;
};

/**
 * Toggle user status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Updated user with new status
 */
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent deactivating the last admin
  if (user.role === ROLES.ADMIN && user.status === USER_STATUS.ACTIVE) {
    const activeAdminCount = await User.countDocuments({ 
      role: ROLES.ADMIN, 
      status: USER_STATUS.ACTIVE 
    });
    if (activeAdminCount <= 1) {
      throw new Error('Cannot deactivate the last active admin');
    }
  }

  // Toggle status
  user.status = user.status === USER_STATUS.ACTIVE 
    ? USER_STATUS.INACTIVE 
    : USER_STATUS.ACTIVE;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    updatedAt: user.updatedAt
  };
};

/**
 * Get users by role
 * @param {string} role - Role to filter by
 * @returns {Promise<Array>} - Users with specified role
 */
const getUsersByRole = async (role) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role');
  }

  const users = await User.find({ role, status: USER_STATUS.ACTIVE });

  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  }));
};

/**
 * Get user statistics
 * @returns {Promise<Object>} - User statistics
 */
const getUserStats = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: USER_STATUS.ACTIVE });
  const inactiveUsers = await User.countDocuments({ status: USER_STATUS.INACTIVE });
  
  const usersByRole = {};
  for (const role of Object.values(ROLES)) {
    usersByRole[role] = await User.countDocuments({ role });
  }

  return {
    total: totalUsers,
    active: activeUsers,
    inactive: inactiveUsers,
    byRole: usersByRole
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUsersByRole,
  getUserStats
};
