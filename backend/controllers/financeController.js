/**
 * Finance Controller
 * Handles financial records HTTP requests
 */

const financeService = require('../services/financeService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Create a new financial record
 * POST /api/finances
 */
const createRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const record = await financeService.createRecord(userId, req.body);
    
    return successResponse(
      res,
      'Financial record created successfully',
      record,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all financial records
 * GET /api/finances
 */
const getAllRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const result = await financeService.getAllRecords(req.query, userId, userRole);
    
    return successResponse(
      res,
      'Financial records retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get financial record by ID
 * GET /api/finances/:id
 */
const getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const record = await financeService.getRecordById(id, userId, userRole);
    
    return successResponse(
      res,
      'Financial record retrieved successfully',
      record
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update financial record
 * PUT /api/finances/:id
 */
const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const record = await financeService.updateRecord(id, req.body);
    
    return successResponse(
      res,
      'Financial record updated successfully',
      record
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete financial record
 * DELETE /api/finances/:id
 */
const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await financeService.deleteRecord(id);
    
    return successResponse(
      res,
      'Financial record deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get categories
 * GET /api/finances/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await financeService.getCategories();
    
    return successResponse(
      res,
      'Categories retrieved successfully',
      categories
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getCategories
};
