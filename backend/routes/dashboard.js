/**
 * Dashboard Routes
 * Routes for dashboard analytics and summaries
 */

const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { requireAnyRole, canViewAnalytics } = require('../middleware/rbac');
const { validateDashboardQuery } = require('../middleware/validation');

/**
 * @route   GET /api/dashboard
 * @desc    Get complete dashboard data
 * @access  Private (Analyst, Admin)
 */
router.get('/', authenticate, canViewAnalytics, validateDashboardQuery, dashboardController.getDashboardData);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary (totals, balance)
 * @access  Private (All authenticated users)
 */
router.get('/summary', authenticate, requireAnyRole, validateDashboardQuery, dashboardController.getSummary);

/**
 * @route   GET /api/dashboard/category-summary
 * @desc    Get category-wise summary
 * @access  Private (Analyst, Admin)
 */
router.get('/category-summary', authenticate, canViewAnalytics, validateDashboardQuery, dashboardController.getCategorySummary);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent financial activity
 * @access  Private (All authenticated users)
 */
router.get('/recent-activity', authenticate, requireAnyRole, dashboardController.getRecentActivity);

/**
 * @route   GET /api/dashboard/trends/monthly
 * @desc    Get monthly trends
 * @access  Private (Analyst, Admin)
 */
router.get('/trends/monthly', authenticate, canViewAnalytics, validateDashboardQuery, dashboardController.getMonthlyTrends);

/**
 * @route   GET /api/dashboard/trends/weekly
 * @desc    Get weekly trends
 * @access  Private (Analyst, Admin)
 */
router.get('/trends/weekly', authenticate, canViewAnalytics, validateDashboardQuery, dashboardController.getWeeklyTrends);

module.exports = router;
