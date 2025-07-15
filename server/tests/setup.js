/**
 * Jest Setup File for Haven Word Church Backend Tests
 * 
 * This file configures the testing environment for the Node.js backend
 * including MongoDB memory server setup and global test utilities.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Setup MongoDB Memory Server
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('✅ MongoDB Memory Server connected for testing');
});

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  
  console.log('✅ MongoDB Memory Server stopped');
});

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const defaultUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPass123!',
      role: 'member',
      phone: '+2348012345678',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test Street, Lagos',
      isActive: true,
      emailVerified: true,
      ...userData
    };
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    defaultUser.password = await bcrypt.hash(defaultUser.password, salt);
    
    return await User.create(defaultUser);
  },

  // Create test admin user
  createTestAdmin: async (adminData = {}) => {
    return await global.testUtils.createTestUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@havenword.com',
      role: 'admin',
      ...adminData
    });
  },

  // Create test event
  createTestEvent: async (eventData = {}) => {
    const Event = require('../models/Event');
    
    const defaultEvent = {
      title: 'Test Event',
      description: 'This is a test event',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startTime: '10:00',
      endTime: '12:00',
      location: {
        venue: 'Test Venue',
        address: '123 Test Street, Lagos',
        coordinates: {
          lat: 6.5244,
          lng: 3.3792
        }
      },
      category: 'service',
      eventType: 'regular',
      status: 'published',
      visibility: 'Public',
      createdBy: eventData.createdBy || (await global.testUtils.createTestUser())._id,
      ...eventData
    };
    
    return await Event.create(defaultEvent);
  },

  // Create test sermon
  createTestSermon: async (sermonData = {}) => {
    const Sermon = require('../models/Sermon');
    
    const defaultSermon = {
      title: 'Test Sermon',
      description: 'This is a test sermon',
      preacher: 'Pastor Test',
      date: new Date(),
      scriptureReference: 'John 3:16',
      duration: 45,
      status: 'published',
      createdBy: sermonData.createdBy || (await global.testUtils.createTestUser())._id,
      ...sermonData
    };
    
    return await Sermon.create(defaultSermon);
  },

  // Create test prayer request
  createTestPrayerRequest: async (prayerData = {}) => {
    const PrayerRequest = require('../models/PrayerRequest');
    
    const defaultPrayer = {
      title: 'Test Prayer Request',
      description: 'This is a test prayer request',
      category: 'personal',
      urgency: 'normal',
      anonymous: false,
      status: 'pending',
      user: prayerData.user || (await global.testUtils.createTestUser())._id,
      ...prayerData
    };
    
    return await PrayerRequest.create(defaultPrayer);
  },

  // Generate JWT token for testing
  generateTestToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  // Mock email sending
  mockEmailSending: () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      }),
      verify: jest.fn().mockResolvedValue(true)
    };
    
    jest.spyOn(nodemailer, 'createTransporter').mockReturnValue(mockTransporter);
    return mockTransporter;
  },

  // Mock Cloudinary upload
  mockCloudinaryUpload: () => {
    const cloudinary = require('cloudinary').v2;
    
    jest.spyOn(cloudinary.uploader, 'upload').mockResolvedValue({
      public_id: 'test-public-id',
      secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
      url: 'http://res.cloudinary.com/test/image/upload/test.jpg'
    });
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Clean up mocks
  cleanupMocks: () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  }
};

// Environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = 5001;

// Suppress console logs during tests unless explicitly needed
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 