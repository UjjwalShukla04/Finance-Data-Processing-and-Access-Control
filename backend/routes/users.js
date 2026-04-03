/**
 * User Management Routes
 * Routes for user CRUD operations
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, canManageUsers } = require('../middleware/rbac');
const { validateUserUpdate, validateUserId } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private (Admin only)
 */
router.get('/', authenticate, canManageUsers, userController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, canManageUsers, userController.getUserStats);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post('/', authenticate, canManageUsers, userController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticate, canManageUsers, validateUserId, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, canManageUsers, validateUserId, validateUserUpdate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, canManageUsers, validateUserId, userController.deleteUser);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Toggle user status (active/inactive)
 * @access  Private (Admin only)
 */
router.put('/:id/status', authenticate, canManageUsers, validateUserId, userController.toggleUserStatus);

module.exports = router;
