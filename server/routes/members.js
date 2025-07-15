const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const memberController = require('../controllers/memberController');

// Dashboard
router.get('/dashboard', auth, memberController.getDashboard);

// Prayer Requests
router.get('/prayer-requests', auth, memberController.getPrayerRequests);
router.post('/prayer-requests', auth, memberController.createPrayerRequest);
router.put('/prayer-requests/:id', auth, memberController.updatePrayerRequest);
router.delete('/prayer-requests/:id', auth, memberController.deletePrayerRequest);

// Donations
router.get('/donations', auth, memberController.getDonations);
router.post('/donations', auth, memberController.createDonation);

// Profile Management
router.get('/profile', auth, memberController.getProfile);
router.put('/profile', auth, memberController.updateProfile);
router.put('/change-password', auth, memberController.changePassword);
router.post('/upload-photo', auth, memberController.uploadProfilePhoto);

// Event RSVP
router.get('/my-events', auth, memberController.getMyEvents);
router.post('/events/:eventId/rsvp', auth, memberController.rsvpToEvent);

module.exports = router;
