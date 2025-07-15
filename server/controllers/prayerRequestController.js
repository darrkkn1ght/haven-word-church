const PrayerRequest = require('../models/PrayerRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notificationService');
const emailNotificationService = require('../services/emailNotificationService');

// GET /api/prayer-requests - Get all prayer requests (admin only)
exports.getAllPrayerRequests = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const prayerRequests = await PrayerRequest.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await PrayerRequest.countDocuments(query);

    res.json({
      prayerRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching prayer requests:', err);
    res.status(500).json({ message: 'Failed to load prayer requests.' });
  }
};

// PATCH /api/prayer-requests/:id/status - Update prayer request status (admin only)
exports.updatePrayerRequestStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!['pending', 'approved', 'rejected', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prayerRequest = await PrayerRequest.findById(id).populate('user', 'name email');
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found.' });
    }

    const oldStatus = prayerRequest.status;
    prayerRequest.status = status;
    if (adminResponse) {
      prayerRequest.adminResponse = adminResponse;
    }
    prayerRequest.updatedBy = req.user.id;
    prayerRequest.updatedAt = new Date();

    await prayerRequest.save();

    // Create notification for the user
    const notification = new Notification({
      user: prayerRequest.user._id,
      type: 'prayer_request_update',
      title: 'Prayer Request Update',
      message: `Your prayer request "${prayerRequest.title}" has been ${status}`,
      data: {
        prayerRequestId: prayerRequest._id,
        oldStatus,
        newStatus: status,
        adminResponse
      }
    });

    await notification.save();

    // Send real-time notification
    await sendNotification({
      userId: prayerRequest.user._id,
      type: 'prayer_request_update',
      title: 'Prayer Request Update',
      message: `Your prayer request "${prayerRequest.title}" has been ${status}`,
      data: {
        prayerRequestId: prayerRequest._id,
        title: prayerRequest.title,
        status
      }
    });

    // Send email notification
    await emailNotificationService.sendPrayerRequestUpdate(
      prayerRequest,
      status,
      adminResponse
    );

    res.json({ 
      message: 'Prayer request status updated successfully.',
      prayerRequest 
    });
  } catch (err) {
    console.error('Error updating prayer request status:', err);
    res.status(500).json({ message: 'Failed to update prayer request status.' });
  }
};

// DELETE /api/prayer-requests/:id - Delete prayer request (admin only)
exports.deletePrayerRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const prayerRequest = await PrayerRequest.findById(id);
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found.' });
    }

    await PrayerRequest.findByIdAndDelete(id);

    // Create notification for the user
    const notification = new Notification({
      user: prayerRequest.user,
      type: 'prayer_request_deleted',
      title: 'Prayer Request Deleted',
      message: `Your prayer request "${prayerRequest.title}" has been deleted by an administrator.`
    });

    await notification.save();

    // Send real-time notification
    await sendNotification({
      userId: prayerRequest.user,
      type: 'prayer_request_deleted',
      title: 'Prayer Request Deleted',
      message: `Your prayer request "${prayerRequest.title}" has been deleted by an administrator.`
    });

    res.json({ message: 'Prayer request deleted successfully.' });
  } catch (err) {
    console.error('Error deleting prayer request:', err);
    res.status(500).json({ message: 'Failed to delete prayer request.' });
  }
};

// GET /api/prayer-requests/stats - Get prayer request statistics (admin only)
exports.getPrayerRequestStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const total = await PrayerRequest.countDocuments();
    const pending = await PrayerRequest.countDocuments({ status: 'pending' });
    const approved = await PrayerRequest.countDocuments({ status: 'approved' });
    const rejected = await PrayerRequest.countDocuments({ status: 'rejected' });
    const inProgress = await PrayerRequest.countDocuments({ status: 'in_progress' });
    const completed = await PrayerRequest.countDocuments({ status: 'completed' });

    // Get recent prayer requests
    const recent = await PrayerRequest.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get prayer requests by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await PrayerRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      stats: {
        total,
        pending,
        approved,
        rejected,
        inProgress,
        completed
      },
      recent,
      monthlyStats
    });
  } catch (err) {
    console.error('Error fetching prayer request stats:', err);
    res.status(500).json({ message: 'Failed to load prayer request statistics.' });
  }
}; 