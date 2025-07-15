const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const prayerRequestController = require('../controllers/prayerRequestController');

// Admin routes for prayer request management
router.get('/', auth, role(['admin']), prayerRequestController.getAllPrayerRequests);
router.patch('/:id/status', auth, role(['admin']), prayerRequestController.updatePrayerRequestStatus);
router.delete('/:id', auth, role(['admin']), prayerRequestController.deletePrayerRequest);
router.get('/stats', auth, role(['admin']), prayerRequestController.getPrayerRequestStats);

module.exports = router; 