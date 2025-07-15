const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Sermon = require('../models/Sermon');
const User = require('../models/User');
const Donation = require('../models/Donation');
const PrayerRequest = require('../models/PrayerRequest');
const Notification = require('../models/Notification');
const SpiritualGrowth = require('../models/SpiritualGrowth');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Attendance
    const attendanceRecords = await Attendance.find({ user: userId });
    const totalServices = await Event.countDocuments({});
    const attendanceRate = totalServices ? Math.round((attendanceRecords.length / totalServices) * 100) : 0;

    // Giving
    const donations = await Donation.find({ user: userId }).sort({ date: -1 });
    const currentYear = new Date().getFullYear();
    const givingThisYear = donations
      .filter(d => new Date(d.date).getFullYear() === currentYear)
      .reduce((sum, d) => sum + d.amount, 0);
    const givingHistory = donations.slice(0, 3);

    // Prayer Requests
    const prayerRequests = await PrayerRequest.find({ user: userId });
    const prayerRequestsSubmitted = prayerRequests.length;

    // Ministries
    const ministries = user.ministries || [];

    // Upcoming events
    const upcomingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(3);

    // Recent sermons
    const recentSermons = await Sermon.find().sort({ date: -1 }).limit(2);

    // Notifications
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Spiritual growth
    const spiritualGrowth = await SpiritualGrowth.findOne({ user: userId });

    res.json({
      member: {
        name: user.name,
        membershipDate: user.membershipDate,
        ministries,
        avatar: user.avatar,
        phoneNumber: user.phone,
        email: user.email,
      },
      stats: {
        attendanceRate,
        servicesAttended: attendanceRecords.length,
        totalServices,
        prayerRequestsSubmitted,
        givingThisYear,
        ministryInvolvement: ministries.length,
      },
      upcomingEvents,
      recentSermons,
      givingHistory,
      notifications,
      spiritualGrowth,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard data.' });
  }
};

// Prayer Requests Management
exports.getPrayerRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const prayerRequests = await PrayerRequest.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await PrayerRequest.countDocuments(query);

    res.json({
      prayerRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load prayer requests.' });
  }
};

exports.createPrayerRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const prayerRequest = new PrayerRequest({
      user: userId,
      title,
      message
    });

    await prayerRequest.save();

    res.status(201).json({ 
      message: 'Prayer request submitted successfully.',
      prayerRequest 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit prayer request.' });
  }
};

exports.updatePrayerRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, message } = req.body;

    const prayerRequest = await PrayerRequest.findOne({ _id: id, user: userId });
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found.' });
    }

    if (prayerRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit prayer request that is not pending.' });
    }

    prayerRequest.title = title;
    prayerRequest.message = message;
    await prayerRequest.save();

    res.json({ 
      message: 'Prayer request updated successfully.',
      prayerRequest 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update prayer request.' });
  }
};

exports.deletePrayerRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const prayerRequest = await PrayerRequest.findOne({ _id: id, user: userId });
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found.' });
    }

    await PrayerRequest.findByIdAndDelete(id);

    res.json({ message: 'Prayer request deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete prayer request.' });
  }
};

// Donations Management
exports.getDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type, year } = req.query;
    
    const query = { user: userId };
    if (type && type !== 'all') {
      query.type = type;
    }
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const donations = await Donation.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Donation.countDocuments(query);
    const totalAmount = await Donation.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load donations.' });
  }
};

exports.createDonation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, type, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    const donation = new Donation({
      user: userId,
      amount,
      type: type || 'Offering',
      method: method || 'Bank Transfer'
    });

    await donation.save();

    res.status(201).json({ 
      message: 'Donation recorded successfully.',
      donation 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record donation.' });
  }
};

// Profile Management
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, dateOfBirth, emergencyContact } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (emergencyContact) user.emergencyContact = emergencyContact;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully.',
      data: user 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password.' });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update user's avatar field with the uploaded file URL
    user.avatar = req.file.path; // Assuming multer saves the file path
    await user.save();

    res.json({ 
      message: 'Profile photo uploaded successfully.',
      profilePhoto: user.avatar 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload profile photo.' });
  }
};

// Event RSVP Management
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Get events where user has RSVP'd
    const events = await Event.find({
      'rsvps.user': userId
    })
    .populate('rsvps.user', 'name email')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    const total = await Event.countDocuments({ 'rsvps.user': userId });

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load events.' });
  }
};

exports.rsvpToEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { status, guests } = req.body; // status: 'going', 'maybe', 'not_going'

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if user already RSVP'd
    const existingRSVP = event.rsvps.find(rsvp => rsvp.user.toString() === userId);
    
    if (existingRSVP) {
      // Update existing RSVP
      existingRSVP.status = status;
      existingRSVP.guests = guests || 0;
      existingRSVP.updatedAt = new Date();
    } else {
      // Add new RSVP
      event.rsvps.push({
        user: userId,
        status,
        guests: guests || 0
      });
    }

    await event.save();

    res.json({ 
      message: 'RSVP updated successfully.',
      event 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update RSVP.' });
  }
};
