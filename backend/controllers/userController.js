/**
 * User Controller
 * Handles user management HTTP requests
 */

const userService = require('../services/userService');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    
    return successResponse(
      res,
      'Users retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    return successResponse(
      res,
      'User retrieved successfully',
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    
    return successResponse(
      res,
      'User created successfully',
      user,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.updateUser(id, req.body);
    
    return successResponse(
      res,
      'User updated successfully',
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (soft delete)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await userService.deleteUser(id);
    
    return successResponse(
      res,
      'User deactivated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user status
 * PUT /api/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.toggleUserStatus(id);
    
    return successResponse(
      res,
      `User status changed to ${user.status}`,
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 * GET /api/users/stats
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await userService.getUserStats();
    
    return successResponse(
      res,
      'User statistics retrieved successfully',
      stats
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
};
