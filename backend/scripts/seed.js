/**
 * Database Seed Script
 * Seeds the database with sample data for testing
 */

require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');
const { ROLES, USER_STATUS, RECORD_TYPES } = require('../utils/constants');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  },
  {
    name: 'Analyst User',
    email: 'analyst@example.com',
    password: 'password123',
    role: ROLES.ANALYST,
    status: USER_STATUS.ACTIVE
  },
  {
    name: 'Viewer User',
    email: 'viewer@example.com',
    password: 'password123',
    role: ROLES.VIEWER,
    status: USER_STATUS.ACTIVE
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'password123',
    role: ROLES.VIEWER,
    status: USER_STATUS.INACTIVE
  }
];

const generateFinancialRecords = (userId) => {
  const records = [];
  const categories = {
    income: ['salary', 'freelance', 'investment', 'business'],
    expense: ['housing', 'food', 'transportation', 'utilities', 'entertainment', 'shopping']
  };

  // Generate records for the last 6 months
  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.4 ? RECORD_TYPES.INCOME : RECORD_TYPES.EXPENSE;
    const categoryList = categories[type];
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    // Random date within last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    
    // Random amount
    const amount = type === RECORD_TYPES.INCOME 
      ? Math.floor(Math.random() * 5000) + 1000  // Income: 1000-6000
      : Math.floor(Math.random() * 500) + 50;     // Expense: 50-550

    records.push({
      userId,
      amount,
      type,
      category,
      date,
      description: `${type === RECORD_TYPES.INCOME ? 'Received' : 'Paid for'} ${category}`,
      notes: `Sample ${type} record`
    });
  }

  return records;
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`  Created: ${user.name} (${user.role})`);
    }

    // Create financial records for each active user
    console.log('Creating financial records...');
    for (const user of createdUsers) {
      if (user.status === USER_STATUS.ACTIVE) {
        const records = generateFinancialRecords(user._id);
        await FinancialRecord.insertMany(records);
        console.log(`  Created ${records.length} records for ${user.name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin:    admin@example.com / password123');
    console.log('  Analyst:  analyst@example.com / password123');
    console.log('  Viewer:   viewer@example.com / password123');
    console.log('  Inactive: inactive@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
