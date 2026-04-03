/**
 * Financial Records Routes
 * Routes for financial records CRUD operations
 */

const express = require('express');
const router = express.Router();

const financeController = require('../controllers/financeController');
const { authenticate } = require('../middleware/auth');
const { 
  canCreateRecords, 
  canUpdateRecords, 
  canDeleteRecords,
  requireAnyRole 
} = require('../middleware/rbac');
const { 
  validateFinanceCreate, 
  validateFinanceUpdate, 
  validateFinanceId,
  validateFinanceList 
} = require('../middleware/validation');

/**
 * @route   GET /api/finances
 * @desc    Get all financial records with filtering and pagination
 * @access  Private (All authenticated users)
 */
router.get('/', authenticate, requireAnyRole, validateFinanceList, financeController.getAllRecords);

/**
 * @route   GET /api/finances/categories
 * @desc    Get all categories used in records
 * @access  Private (All authenticated users)
 */
router.get('/categories', authenticate, requireAnyRole, financeController.getCategories);

/**
 * @route   POST /api/finances
 * @desc    Create a new financial record
 * @access  Private (Analyst, Admin)
 */
router.post('/', authenticate, canCreateRecords, validateFinanceCreate, financeController.createRecord);

/**
 * @route   GET /api/finances/:id
 * @desc    Get financial record by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', authenticate, requireAnyRole, validateFinanceId, financeController.getRecordById);

/**
 * @route   PUT /api/finances/:id
 * @desc    Update financial record
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, canUpdateRecords, validateFinanceId, validateFinanceUpdate, financeController.updateRecord);

/**
 * @route   DELETE /api/finances/:id
 * @desc    Delete financial record (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, canDeleteRecords, validateFinanceId, financeController.deleteRecord);

module.exports = router;
