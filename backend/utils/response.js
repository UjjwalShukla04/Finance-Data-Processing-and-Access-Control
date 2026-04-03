/**
 * Standardized API Response Utilities
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error details
 */
const errorResponse = (res, message = 'Error occurred', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: error ? error.toString() : null
  });
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    data: null,
    error: errors
  });
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    data: null,
    error: 'Unauthorized'
  });
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbiddenResponse = (res, message = 'Access denied') => {
  return res.status(403).json({
    success: false,
    message,
    data: null,
    error: 'Forbidden'
  });
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    data: null,
    error: 'Not Found'
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};
