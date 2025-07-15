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

module.exports = router; 