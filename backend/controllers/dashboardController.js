/**
 * Dashboard Controller
 * Handles dashboard analytics HTTP requests
 */

const dashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get dashboard summary
 * GET /api/dashboard/summary
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const summary = await dashboardService.getSummary(userId, userRole, req.query);
    
    return successResponse(
      res,
      'Dashboard summary retrieved successfully',
      summary
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get category summary
 * GET /api/dashboard/category-summary
 */
const getCategorySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const categories = await dashboardService.getCategorySummary(userId, userRole, req.query);
    
    return successResponse(
      res,
      'Category summary retrieved successfully',
      categories
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity
 * GET /api/dashboard/recent-activity
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;
    
    const activity = await dashboardService.getRecentActivity(userId, userRole, limit);
    
    return successResponse(
      res,
      'Recent activity retrieved successfully',
      activity
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly trends
 * GET /api/dashboard/trends/monthly
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const trends = await dashboardService.getMonthlyTrends(userId, userRole, req.query);
    
    return successResponse(
      res,
      'Monthly trends retrieved successfully',
      trends
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly trends
 * GET /api/dashboard/trends/weekly
 */
const getWeeklyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const trends = await dashboardService.getWeeklyTrends(userId, userRole, req.query);
    
    return successResponse(
      res,
      'Weekly trends retrieved successfully',
      trends
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get complete dashboard data
 * GET /api/dashboard
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const dashboardData = await dashboardService.getDashboardData(userId, userRole, req.query);
    
    return successResponse(
      res,
      'Dashboard data retrieved successfully',
      dashboardData
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategorySummary,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
  getDashboardData
};
