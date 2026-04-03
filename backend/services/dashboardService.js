/**
 * Dashboard Service
 * Business logic for dashboard analytics and summaries
 */

const FinancialRecord = require('../models/FinancialRecord');
const { RECORD_TYPES } = require('../utils/constants');

/**
 * Get dashboard summary (totals and balance)
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters (date range)
 * @returns {Promise<Object>} - Summary data
 */
const getSummary = async (userId, userRole, queryParams = {}) => {
  const matchStage = buildMatchStage(userId, userRole, queryParams);

  const summary = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  summary.forEach(item => {
    if (item._id === RECORD_TYPES.INCOME) {
      totalIncome = item.total;
      incomeCount = item.count;
    } else if (item._id === RECORD_TYPES.EXPENSE) {
      totalExpense = item.total;
      expenseCount = item.count;
    }
  });

  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpense: parseFloat(totalExpense.toFixed(2)),
    netBalance: parseFloat(netBalance.toFixed(2)),
    incomeCount,
    expenseCount,
    totalRecords: incomeCount + expenseCount
  };
};

/**
 * Get category-wise summary
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Category summary
 */
const getCategorySummary = async (userId, userRole, queryParams = {}) => {
  const matchStage = buildMatchStage(userId, userRole, queryParams);

  const categoryData = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const incomeByCategory = [];
  const expenseByCategory = [];

  categoryData.forEach(item => {
    const categoryInfo = {
      category: item._id.category,
      amount: parseFloat(item.total.toFixed(2)),
      count: item.count
    };

    if (item._id.type === RECORD_TYPES.INCOME) {
      incomeByCategory.push(categoryInfo);
    } else {
      expenseByCategory.push(categoryInfo);
    }
  });

  return {
    income: incomeByCategory,
    expense: expenseByCategory
  };
};

/**
 * Get recent activity
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} - Recent records
 */
const getRecentActivity = async (userId, userRole, limit = 10) => {
  const matchStage = buildMatchStage(userId, userRole, {});

  const records = await FinancialRecord.find(matchStage)
    .populate('userId', 'name email')
    .sort({ date: -1 })
    .limit(limit);

  return records.map(record => ({
    id: record._id,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    description: record.description,
    user: record.userId ? {
      name: record.userId.name,
      email: record.userId.email
    } : null
  }));
};

/**
 * Get monthly trends
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>} - Monthly trend data
 */
const getMonthlyTrends = async (userId, userRole, queryParams = {}) => {
  const matchStage = buildMatchStage(userId, userRole, queryParams);

  const trends = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format the data
  const monthlyData = {};

  trends.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = {
        period: key,
        income: 0,
        expense: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0
      };
    }

    if (item._id.type === RECORD_TYPES.INCOME) {
      monthlyData[key].income = parseFloat(item.total.toFixed(2));
      monthlyData[key].incomeCount = item.count;
    } else {
      monthlyData[key].expense = parseFloat(item.total.toFixed(2));
      monthlyData[key].expenseCount = item.count;
    }

    monthlyData[key].balance = parseFloat(
      (monthlyData[key].income - monthlyData[key].expense).toFixed(2)
    );
  });

  return Object.values(monthlyData);
};

/**
 * Get weekly trends
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>} - Weekly trend data
 */
const getWeeklyTrends = async (userId, userRole, queryParams = {}) => {
  const matchStage = buildMatchStage(userId, userRole, queryParams);

  const trends = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          week: { $week: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // Format the data
  const weeklyData = {};

  trends.forEach(item => {
    const key = `${item._id.year}-W${String(item._id.week).padStart(2, '0')}`;
    
    if (!weeklyData[key]) {
      weeklyData[key] = {
        period: key,
        income: 0,
        expense: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0
      };
    }

    if (item._id.type === RECORD_TYPES.INCOME) {
      weeklyData[key].income = parseFloat(item.total.toFixed(2));
      weeklyData[key].incomeCount = item.count;
    } else {
      weeklyData[key].expense = parseFloat(item.total.toFixed(2));
      weeklyData[key].expenseCount = item.count;
    }

    weeklyData[key].balance = parseFloat(
      (weeklyData[key].income - weeklyData[key].expense).toFixed(2)
    );
  });

  return Object.values(weeklyData);
};

/**
 * Get comprehensive dashboard data
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Complete dashboard data
 */
const getDashboardData = async (userId, userRole, queryParams = {}) => {
  const [summary, categorySummary, recentActivity, monthlyTrends] = await Promise.all([
    getSummary(userId, userRole, queryParams),
    getCategorySummary(userId, userRole, queryParams),
    getRecentActivity(userId, userRole, 10),
    getMonthlyTrends(userId, userRole, queryParams)
  ]);

  return {
    summary,
    categories: categorySummary,
    recentActivity,
    trends: {
      monthly: monthlyTrends
    }
  };
};

/**
 * Build MongoDB match stage based on user role and filters
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {Object} queryParams - Query parameters
 * @returns {Object} - Match stage object
 */
const buildMatchStage = (userId, userRole, queryParams) => {
  const matchStage = { isDeleted: false };

  // Non-admin users can only see their own records
  if (userRole !== 'admin') {
    matchStage.userId = require('mongoose').Types.ObjectId(userId);
  } else if (queryParams.userId) {
    matchStage.userId = require('mongoose').Types.ObjectId(queryParams.userId);
  }

  // Type filter
  if (queryParams.type && Object.values(RECORD_TYPES).includes(queryParams.type)) {
    matchStage.type = queryParams.type;
  }

  // Date range filter
  if (queryParams.startDate || queryParams.endDate) {
    matchStage.date = {};
    if (queryParams.startDate) {
      matchStage.date.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      matchStage.date.$lte = new Date(queryParams.endDate);
    }
  }

  // Period filter (week, month, quarter, year)
  if (queryParams.period) {
    const now = new Date();
    let startDate;

    switch (queryParams.period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    if (startDate) {
      matchStage.date = matchStage.date || {};
      matchStage.date.$gte = startDate;
    }
  }

  return matchStage;
};

module.exports = {
  getSummary,
  getCategorySummary,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
  getDashboardData
};

