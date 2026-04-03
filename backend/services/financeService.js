/**
 * Finance Service
 * Business logic for financial records management
 */

const FinancialRecord = require('../models/FinancialRecord');
const { RECORD_TYPES, PAGINATION } = require('../utils/constants');

/**
 * Create a new financial record
 * @param {string} userId - User ID creating the record
 * @param {Object} recordData - Financial record data
 * @returns {Promise<Object>} - Created record
 */
const createRecord = async (userId, recordData) => {
  const { amount, type, category, date, description, notes } = recordData;

  const record = await FinancialRecord.create({
    userId,
    amount: parseFloat(amount),
    type,
    category: category.toLowerCase().trim(),
    date: date || new Date(),
    description: description || '',
    notes: notes || ''
  });

  return await getRecordById(record._id, userId, 'admin');
};

/**
 * Get all financial records with filtering and pagination
 * @param {Object} queryParams - Query parameters
 * @param {string} userId - User ID (for filtering by user)
 * @param {string} userRole - User role (admin can see all)
 * @returns {Promise<Object>} - Records list and pagination info
 */
const getAllRecords = async (queryParams = {}, userId = null, userRole = 'viewer') => {
  const page = parseInt(queryParams.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(queryParams.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { isDeleted: false };

  // Non-admin users can only see their own records
  if (userRole !== 'admin') {
    filter.userId = userId;
  } else if (queryParams.userId) {
    // Admin can filter by specific user
    filter.userId = queryParams.userId;
  }

  // Type filter
  if (queryParams.type && Object.values(RECORD_TYPES).includes(queryParams.type)) {
    filter.type = queryParams.type;
  }

  // Category filter
  if (queryParams.category) {
    filter.category = queryParams.category.toLowerCase().trim();
  }

  // Date range filter
  if (queryParams.startDate || queryParams.endDate) {
    filter.date = {};
    if (queryParams.startDate) {
      filter.date.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      filter.date.$lte = new Date(queryParams.endDate);
    }
  }

  // Sorting
  const sortBy = queryParams.sortBy || 'date';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  const sort = {};
  sort[sortBy] = sortOrder;

  // Execute query
  const records = await FinancialRecord.find(filter)
    .populate('userId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  // Get total count
  const total = await FinancialRecord.countDocuments(filter);

  return {
    records: records.map(record => formatRecord(record)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Get single record by ID
 * @param {string} recordId - Record ID
 * @param {string} userId - User ID (for access check)
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Record data
 */
const getRecordById = async (recordId, userId = null, userRole = 'viewer') => {
  const record = await FinancialRecord.findById(recordId)
    .populate('userId', 'name email');

  if (!record) {
    throw new Error('Financial record not found');
  }

  // Check access (non-admin can only see their own records)
  // After populate, userId is an object with _id, name, email
  // Before populate, userId is just the ObjectId
  const recordUserId = record.userId && record.userId._id 
    ? record.userId._id.toString() 
    : record.userId.toString();
  
  if (userRole !== 'admin' && recordUserId !== userId.toString()) {
    throw new Error('Access denied');
  }

  return formatRecord(record);
};

/**
 * Update financial record
 * @param {string} recordId - Record ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated record
 */
const updateRecord = async (recordId, updateData) => {
  const record = await FinancialRecord.findById(recordId);

  if (!record) {
    throw new Error('Financial record not found');
  }

  // Update fields
  const allowedUpdates = ['amount', 'type', 'category', 'date', 'description', 'notes'];
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'amount') {
        record[field] = parseFloat(updateData[field]);
      } else if (field === 'category') {
        record[field] = updateData[field].toLowerCase().trim();
      } else {
        record[field] = updateData[field];
      }
    }
  });

  await record.save();

  return await getRecordById(recordId);
};

/**
 * Delete financial record (soft delete)
 * @param {string} recordId - Record ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteRecord = async (recordId) => {
  const record = await FinancialRecord.findById(recordId);

  if (!record) {
    throw new Error('Financial record not found');
  }

  await record.softDelete();
  return true;
};

/**
 * Get records by user ID
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - User's records
 */
const getRecordsByUser = async (userId, queryParams = {}) => {
  const page = parseInt(queryParams.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(queryParams.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const filter = { userId, isDeleted: false };

  if (queryParams.type) {
    filter.type = queryParams.type;
  }

  const records = await FinancialRecord.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await FinancialRecord.countDocuments(filter);

  return {
    records: records.map(record => formatRecord(record)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Get all categories used in records
 * @returns {Promise<Object>} - Categories grouped by type
 */
const getCategories = async () => {
  const incomeCategories = await FinancialRecord.distinct('category', { type: RECORD_TYPES.INCOME });
  const expenseCategories = await FinancialRecord.distinct('category', { type: RECORD_TYPES.EXPENSE });

  return {
    income: incomeCategories,
    expense: expenseCategories,
    all: [...new Set([...incomeCategories, ...expenseCategories])]
  };
};

/**
 * Format record for response
 * @param {Object} record - Financial record document
 * @returns {Object} - Formatted record
 */
const formatRecord = (record) => {
  const recordObj = record.toObject ? record.toObject() : record;
  
  // Handle populated userId (after populate, userId is an object with _id, name, email)
  // or non-populated (userId is just the ObjectId)
  const userIdField = recordObj.userId;
  const userId = userIdField && userIdField._id ? userIdField._id : userIdField;
  const user = userIdField && userIdField.name ? {
    name: userIdField.name,
    email: userIdField.email
  } : undefined;
  
  return {
    id: recordObj._id,
    userId: userId,
    user: user,
    amount: recordObj.amount,
    type: recordObj.type,
    category: recordObj.category,
    date: recordObj.date,
    description: recordObj.description,
    notes: recordObj.notes,
    createdAt: recordObj.createdAt,
    updatedAt: recordObj.updatedAt
  };
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getRecordsByUser,
  getCategories,
  formatRecord
};

