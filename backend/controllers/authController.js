/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    
    return successResponse(
      res,
      'User registered successfully',
      result,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    return successResponse(
      res,
      'Login successful',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const profile = await authService.getProfile(userId);
    
    return successResponse(
      res,
      'Profile retrieved successfully',
      profile
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    await authService.changePassword(userId, currentPassword, newPassword);
    
    return successResponse(
      res,
      'Password changed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create initial admin (setup endpoint)
 * POST /api/auth/setup-admin
 */
const createInitialAdmin = async (req, res, next) => {
  try {
    const result = await authService.createInitialAdmin(req.body);
    
    return successResponse(
      res,
      'Initial admin created successfully',
      result,
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  createInitialAdmin
};
