const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /api/users - List all users (admin only)
router.get('/', auth, userController.listUsers);
// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', auth, userController.updateUserRole);
// PATCH /api/users/:id/status - Update user status (admin only)
router.patch('/:id/status', auth, userController.updateUserStatus);
// GET /api/users/profile - Get current user's profile
router.get('/profile', auth, userController.getProfile);
// PUT /api/users/profile - Update current user's profile
router.put('/profile', auth, userController.updateProfile);

module.exports = router; 