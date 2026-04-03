/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions on routes
 */

const { forbiddenResponse, unauthorizedResponse } = require('../utils/response');
const { ROLES, PERMISSIONS } = require('../utils/constants');

/**
 * Check if user has required role(s)
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} - Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(res, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    // Check if user is active
    if (!req.user.isActive()) {
      return forbiddenResponse(res, 'Account is inactive');
    }

    next();
  };
};

/**
 * Check if user has specific permission
 * @param {string} permissionKey - Key from PERMISSIONS object
 * @returns {Function} - Express middleware
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    // Get allowed roles for this permission
    const allowedRoles = PERMISSIONS[permissionKey];
    
    if (!allowedRoles) {
      return forbiddenResponse(res, 'Permission not defined');
    }

    // Check if user's role has this permission
    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(res, 'You do not have permission to perform this action');
    }

    // Check if user is active
    if (!req.user.isActive()) {
      return forbiddenResponse(res, 'Account is inactive');
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Require analyst or admin role
 */
const requireAnalystOrAdmin = requireRole(ROLES.ANALYST, ROLES.ADMIN);

/**
 * Require any authenticated role (viewer, analyst, admin)
 */
const requireAnyRole = requireRole(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN);

/**
 * Check if user can manage users (admin only)
 */
const canManageUsers = requirePermission('MANAGE_USERS');

/**
 * Check if user can create records (analyst, admin)
 */
const canCreateRecords = requirePermission('CREATE_RECORDS');

/**
 * Check if user can update records (admin only)
 */
const canUpdateRecords = requirePermission('UPDATE_RECORDS');

/**
 * Check if user can delete records (admin only)
 */
const canDeleteRecords = requirePermission('DELETE_RECORDS');

/**
 * Check if user can view analytics (analyst, admin)
 */
const canViewAnalytics = requirePermission('VIEW_ANALYTICS');

/**
 * Middleware to check if user owns the resource or is admin
 * Useful for resource-level permissions
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
const requireOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user._id.toString() !== ownerId.toString()) {
        return forbiddenResponse(res, 'You do not have access to this resource');
      }

      next();
    } catch (error) {
      return forbiddenResponse(res, 'Unable to verify resource ownership');
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireAdmin,
  requireAnalystOrAdmin,
  requireAnyRole,
  canManageUsers,
  canCreateRecords,
  canUpdateRecords,
  canDeleteRecords,
  canViewAnalytics,
  requireOwnerOrAdmin
};
