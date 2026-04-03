/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorizedResponse, errorResponse } = require('../utils/response');
const { JWT_CONFIG } = require('../utils/constants');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return unauthorizedResponse(res, 'Access denied. No token provided.');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret', {
        algorithms: [JWT_CONFIG.ALGORITHM]
      });

      // Get user from database (excluding password)
      const user = await User.findById(decoded.id);

      if (!user) {
        return unauthorizedResponse(res, 'User not found.');
      }

      // Check if user is active
      if (!user.isActive()) {
        return unauthorizedResponse(res, 'Account is inactive. Please contact administrator.');
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Token has expired. Please login again.');
      }
      return unauthorizedResponse(res, 'Invalid token.');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Authentication failed', 500, error.message);
  }
};

/**
 * Optional authentication - attaches user if token valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret', {
          algorithms: [JWT_CONFIG.ALGORITHM]
        });

        const user = await User.findById(decoded.id);
        if (user && user.isActive()) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
        req.user = null;
      }
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallbacksecret',
    {
      expiresIn: process.env.JWT_EXPIRE || JWT_CONFIG.EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM
    }
  );
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken
};
