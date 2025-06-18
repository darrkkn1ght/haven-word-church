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
