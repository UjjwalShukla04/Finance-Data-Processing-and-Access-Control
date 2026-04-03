/**
 * Input Validation Middleware
 * Request validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response');
const { ROLES, USER_STATUS, RECORD_TYPES, CATEGORIES } = require('../utils/constants');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return validationErrorResponse(res, formattedErrors);
  }
  
  next();
};

/**
 * User registration validation
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  
  handleValidationErrors
];

/**
 * User login validation
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * User update validation
 */
const validateUserUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  
  body('status')
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(USER_STATUS).join(', ')}`),
  
  handleValidationErrors
];

/**
 * User ID parameter validation
 */
const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors
];

/**
 * Financial record creation validation
 */
const validateFinanceCreate = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(Object.values(RECORD_TYPES))
    .withMessage(`Type must be either: ${Object.values(RECORD_TYPES).join(' or ')}`),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date format'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * Financial record update validation
 */
const validateFinanceUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid record ID format'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('type')
    .optional()
    .isIn(Object.values(RECORD_TYPES))
    .withMessage(`Type must be either: ${Object.values(RECORD_TYPES).join(' or ')}`),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date format'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * Financial record ID validation
 */
const validateFinanceId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid record ID format'),
  
  handleValidationErrors
];

/**
 * Finance list query validation
 */
const validateFinanceList = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(Object.values(RECORD_TYPES))
    .withMessage(`Type must be either: ${Object.values(RECORD_TYPES).join(' or ')}`),
  
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date format'),
  
  query('sortBy')
    .optional()
    .isIn(['date', 'amount', 'category', 'type', 'createdAt'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

/**
 * Dashboard date range validation
 */
const validateDashboardQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date format'),
  
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Period must be week, month, quarter, or year'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUserUpdate,
  validateUserId,
  validateFinanceCreate,
  validateFinanceUpdate,
  validateFinanceId,
  validateFinanceList,
  validateDashboardQuery
};
