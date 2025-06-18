const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const memberController = require('../controllers/memberController');

router.get('/dashboard', auth, memberController.getDashboard);

module.exports = router;
