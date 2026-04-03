/**
 * Financial Record Model
 * Defines the schema for financial entries (income/expense)
 */

const mongoose = require('mongoose');
const { RECORD_TYPES, CATEGORIES } = require('../utils/constants');

const financialRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: {
      values: Object.values(RECORD_TYPES),
      message: 'Type must be either income or expense'
    },
    required: [true, 'Type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
financialRecordSchema.index({ userId: 1, date: -1 });
financialRecordSchema.index({ userId: 1, type: 1 });
financialRecordSchema.index({ userId: 1, category: 1 });
financialRecordSchema.index({ userId: 1, isDeleted: 1 });
financialRecordSchema.index({ type: 1, date: -1 });

/**
 * Pre-find middleware to exclude soft-deleted records by default
 */
financialRecordSchema.pre(/^find/, function() {
  // If isDeleted is not explicitly queried, exclude deleted records
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.where({ isDeleted: false });
  }
});

/**
 * Soft delete a record
 */
financialRecordSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

/**
 * Restore a soft-deleted record
 */
financialRecordSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

/**
 * Check if record belongs to a specific user
 * @param {string} userId - User ID to check
 * @returns {boolean} - True if record belongs to user
 */
financialRecordSchema.methods.belongsTo = function(userId) {
  return this.userId.toString() === userId.toString();
};

// Virtual to check if record is income
financialRecordSchema.virtual('isIncome').get(function() {
  return this.type === RECORD_TYPES.INCOME;
});

// Virtual to check if record is expense
financialRecordSchema.virtual('isExpense').get(function() {
  return this.type === RECORD_TYPES.EXPENSE;
});

// Static method to get valid categories based on type
financialRecordSchema.statics.getValidCategories = function(type) {
  if (type === RECORD_TYPES.INCOME) {
    return CATEGORIES.INCOME;
  } else if (type === RECORD_TYPES.EXPENSE) {
    return CATEGORIES.EXPENSE;
  }
  return [...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE];
};

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);

module.exports = FinancialRecord;

