/**
 * Authentication API Integration Tests
 * 
 * Tests for authentication endpoints including:
 * - User registration
 * - User login
 * - Password reset
 * - Token validation
 * - Role-based access
 */

const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('Authentication API', () => {
  let testUser;
  let adminUser;

  beforeEach(async () => {
    // Create test users
    testUser = await global.testUtils.createTestUser();
    adminUser = await global.testUtils.createTestAdmin();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      phone: '+2348012345678',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test Street, Lagos'
    };

    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.role).toBe('member');
      expect(response.body.data.user.isActive).toBe(true);
      expect(response.body.data.user.emailVerified).toBe(false);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        firstName: '',
        email: 'invalid-email',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toHaveProperty('firstName');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('password');
    });

    test('should validate password strength', async () => {
      const weakPasswordData = {
        ...validUserData,
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.password).toBeDefined();
    });

    test('should validate Nigerian phone number format', async () => {
      const invalidPhoneData = {
        ...validUserData,
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPhoneData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.phone).toBeDefined();
    });

    test('should register admin user with valid admin code', async () => {
      const adminData = {
        ...validUserData,
        email: 'admin@havenword.com',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'HAVEN2024'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should not login with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should not login inactive user', async () => {
      // Deactivate user
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const loginData = {
        email: testUser.email,
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is inactive');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('password');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for existing user', async () => {
      const emailData = {
        email: testUser.email
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    test('should not reveal if email exists or not', async () => {
      const emailData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    test('should validate email format', async () => {
      const emailData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('email');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      // First, request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      // Get reset token from user (in real app, this would be from email)
      const user = await User.findById(testUser._id);
      const resetToken = user.passwordResetToken;

      const resetData = {
        token: resetToken,
        password: 'NewSecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successful');
    });

    test('should not reset password with invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'NewSecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired token');
    });

    test('should not reset password with weak password', async () => {
      const resetData = {
        token: 'valid-token',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('password');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should get current user profile with valid token', async () => {
      const token = global.testUtils.generateTestToken(testUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('should update user profile with valid token', async () => {
      const token = global.testUtils.generateTestToken(testUser);
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+2348098765432'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    test('should not update email without verification', async () => {
      const token = global.testUtils.generateTestToken(testUser);
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email cannot be changed');
    });

    test('should validate phone number format', async () => {
      const token = global.testUtils.generateTestToken(testUser);
      const updateData = {
        phone: '1234567890'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('phone');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user successfully', async () => {
      const token = global.testUtils.generateTestToken(testUser);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('Rate Limiting', () => {
    test('should limit login attempts', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Too many requests');
    });
  });
}); 