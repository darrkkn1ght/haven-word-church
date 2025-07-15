const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const notificationController = require('../controllers/notificationController');

// User notification routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:notificationId/read', auth, notificationController.markAsRead);
router.put('/mark-all-read', auth, notificationController.markAllAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Admin notification routes
router.post('/send', auth, role(['admin']), notificationController.sendNotification);
router.post('/send-to-room', auth, role(['admin']), notificationController.sendToRoom);

module.exports = router; 