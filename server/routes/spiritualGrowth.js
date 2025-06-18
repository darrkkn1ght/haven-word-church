const express = require('express');
const router = express.Router();
const { upsertSpiritualGrowth } = require('../controllers/spiritualGrowthController');
const auth = require('../middleware/auth');

// POST or PUT /api/spiritual-growth
router.post('/', auth, upsertSpiritualGrowth);
router.put('/', auth, upsertSpiritualGrowth);

module.exports = router;
