/**
 * Authentication Tests
 * Basic unit tests for authentication service
 */

const authService = require('../services/authService');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

// Test data
const testAdmin = {
  name: 'Test Admin',
  email: 'testadmin@example.com',
  password: 'password123'
};

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123'
};

describe('Authentication Service', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up test users
    await User.deleteMany({ 
      email: { 
        $in: [testAdmin.email, testUser.email] 
      } 
    });
  });

  describe('Register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(testUser);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.name).toBe(testUser.name);
    });

    it('should not register user with duplicate email', async () => {
      await authService.register(testUser);
      
      await expect(authService.register(testUser))
        .rejects
        .toThrow('User with this email already exists');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      await authService.register(testUser);
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login(testUser.email, testUser.password);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testUser.email);
    });

    it('should not login with invalid password', async () => {
      await expect(authService.login(testUser.email, 'wrongpassword'))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      await expect(authService.login('nonexistent@example.com', 'password'))
        .rejects
        .toThrow('Invalid email or password');
    });
  });

  describe('Get Profile', () => {
    let registeredUser;

    beforeEach(async () => {
      const result = await authService.register(testUser);
      registeredUser = result.user;
    });

    it('should get user profile by ID', async () => {
      const profile = await authService.getProfile(registeredUser.id);
      
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('email');
      expect(profile.email).toBe(testUser.email);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(authService.getProfile(fakeId))
        .rejects
        .toThrow('User not found');
    });
  });
});

// Run tests only if this file is executed directly
if (require.main === module) {
  console.log('Run tests with: npm test');
}
