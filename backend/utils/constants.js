/**
 * Constants for the Finance Dashboard Backend
 */

// User Roles
const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Financial Record Types
const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Common Categories
const CATEGORIES = {
  INCOME: [
    'salary',
    'freelance',
    'investment',
    'business',
    'rental',
    'other_income'
  ],
  EXPENSE: [
    'housing',
    'food',
    'transportation',
    'utilities',
    'healthcare',
    'entertainment',
    'shopping',
    'education',
    'insurance',
    'other_expense'
  ]
};

// Permission Matrix
const PERMISSIONS = {
  VIEW_DASHBOARD: [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN],
  VIEW_RECORDS: [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN],
  CREATE_RECORDS: [ROLES.ANALYST, ROLES.ADMIN],
  UPDATE_RECORDS: [ROLES.ADMIN],
  DELETE_RECORDS: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.ANALYST, ROLES.ADMIN]
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

module.exports = {
  ROLES,
  USER_STATUS,
  RECORD_TYPES,
  CATEGORIES,
  PERMISSIONS,
  PAGINATION,
  JWT_CONFIG
};
