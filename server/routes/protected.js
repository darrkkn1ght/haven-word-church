const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Admin-only test route
router.get('/admin/test', auth, role('admin'), (req, res) => {
  res.json({ message: `Hello Admin ${req.user.name}` });
});

// Member-only test route (also allows admin, pastor, staff)
router.get('/member/test', auth, role('member', 'admin', 'pastor', 'staff'), (req, res) => {
  res.json({ message: `Hello ${req.user.role} ${req.user.name}` });
});

module.exports = router;
