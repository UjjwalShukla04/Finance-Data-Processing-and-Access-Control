/**
 * Global Error Handler Middleware
 * Centralized error handling for the application
 */

const { errorResponse } = require('../utils/response');

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => ({
    field: val.path,
    message: val.message,
    value: val.value
  }));
  
  return {
    message: 'Validation Error',
    statusCode: 400,
    errors
  };
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  return {
    message: `${field} '${value}' already exists`,
    statusCode: 409,
    errors: [{ field, message: `${field} must be unique`, value }]
  };
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  return {
    message: `Invalid ${err.path}: ${err.value}`,
    statusCode: 400,
    errors: [{ field: err.path, message: `Invalid ${err.path} format`, value: err.value }]
  };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return {
    message: 'Invalid token. Please log in again.',
    statusCode: 401,
    errors: null
  };
};

/**
 * Handle JWT expiration errors
 */
const handleJWTExpiredError = () => {
  return {
    message: 'Your token has expired. Please log in again.',
    statusCode: 401,
    errors: null
  };
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = handleValidationError(err);
    error.message = validationError.message;
    error.statusCode = validationError.statusCode;
    error.errors = validationError.errors;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const duplicateError = handleDuplicateKeyError(err);
    error.message = duplicateError.message;
    error.statusCode = duplicateError.statusCode;
    error.errors = duplicateError.errors;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const castError = handleCastError(err);
    error.message = castError.message;
    error.statusCode = castError.statusCode;
    error.errors = castError.errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const jwtError = handleJWTError();
    error.message = jwtError.message;
    error.statusCode = jwtError.statusCode;
  }

  if (err.name === 'TokenExpiredError') {
    const jwtExpiredError = handleJWTExpiredError();
    error.message = jwtExpiredError.message;
    error.statusCode = jwtExpiredError.statusCode;
  }

  // Send error response
  return errorResponse(
    res,
    error.message,
    error.statusCode,
    error.errors || (process.env.NODE_ENV === 'development' ? err.stack : null)
  );
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    
    // Gracefully close server
    server.close(() => {
      process.exit(1);
    });
  });
};

module.exports = {
  APIError,
  globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection
};
