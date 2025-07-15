const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const Sermon = require('../models/Sermon');
const emailNotificationService = require('./emailNotificationService');
const { sendNotification } = require('../utils/notificationService');

/**
 * Scheduled Task Service
 * Handles automated tasks like event reminders, sermon notifications, etc.
 */

class ScheduledTaskService {
  constructor() {
    this.tasks = new Map();
  }

  /**
   * Initialize all scheduled tasks
   */
  init() {
    console.log('🚀 Initializing scheduled tasks...');
    
    // Event reminders - run daily at 8 AM
    this.scheduleEventReminders();
    
    // Weekly sermon notifications - run every Sunday at 6 PM
    this.scheduleSermonNotifications();
    
    // Daily prayer request follow-ups - run daily at 9 AM
    this.schedulePrayerRequestFollowUps();
    
    // Monthly newsletter - run first Sunday of each month at 10 AM
    this.scheduleMonthlyNewsletter();
    
    console.log('✅ Scheduled tasks initialized');
  }

  /**
   * Schedule event reminders
   */
  scheduleEventReminders() {
    const task = cron.schedule('0 8 * * *', async () => {
      console.log('📅 Running event reminders task...');
      await this.sendEventReminders();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    this.tasks.set('eventReminders', task);
    console.log('📅 Event reminders scheduled for 8:00 AM daily');
  }

  /**
   * Schedule sermon notifications
   */
  scheduleSermonNotifications() {
    const task = cron.schedule('0 18 * * 0', async () => {
      console.log('📖 Running sermon notifications task...');
      await this.sendSermonNotifications();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    this.tasks.set('sermonNotifications', task);
    console.log('📖 Sermon notifications scheduled for 6:00 PM Sundays');
  }

  /**
   * Schedule prayer request follow-ups
   */
  schedulePrayerRequestFollowUps() {
    const task = cron.schedule('0 9 * * *', async () => {
      console.log('🙏 Running prayer request follow-ups task...');
      await this.sendPrayerRequestFollowUps();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    this.tasks.set('prayerRequestFollowUps', task);
    console.log('🙏 Prayer request follow-ups scheduled for 9:00 AM daily');
  }

  /**
   * Schedule monthly newsletter
   */
  scheduleMonthlyNewsletter() {
    const task = cron.schedule('0 10 1-7 * 0', async () => {
      console.log('📧 Running monthly newsletter task...');
      await this.sendMonthlyNewsletter();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    this.tasks.set('monthlyNewsletter', task);
    console.log('📧 Monthly newsletter scheduled for 10:00 AM first Sunday of each month');
  }

  /**
   * Send event reminders for events happening tomorrow
   */
  async sendEventReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const events = await Event.find({
        date: {
          $gte: tomorrow,
          $lt: nextDay
        },
        active: true
      });

      console.log(`Found ${events.length} events for tomorrow`);

      for (const event of events) {
        // Get users who have RSVP'd or are members
        const users = await User.find({
          active: true,
          email: { $exists: true, $ne: '' }
        });

        if (users.length > 0) {
          const result = await emailNotificationService.sendBulkEventReminders(event, users);
          console.log(`Event reminder for "${event.title}": ${result.sent} emails sent, ${result.failed} failed`);
        }
      }
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  }

  /**
   * Send sermon notifications for new sermons
   */
  async sendSermonNotifications() {
    try {
      // Get sermons from the last week
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const recentSermons = await Sermon.find({
        createdAt: { $gte: lastWeek },
        status: 'approved'
      });

      console.log(`Found ${recentSermons.length} recent sermons`);

      for (const sermon of recentSermons) {
        // Get users who have opted in for sermon notifications
        const subscribers = await User.find({
          active: true,
          email: { $exists: true, $ne: '' },
          preferences: { $elemMatch: { type: 'sermon_notifications', enabled: true } }
        });

        if (subscribers.length > 0) {
          const result = await emailNotificationService.sendNewSermonNotification(sermon, subscribers);
          console.log(`Sermon notification for "${sermon.title}": ${result.sent} emails sent, ${result.failed} failed`);
        }
      }
    } catch (error) {
      console.error('Error sending sermon notifications:', error);
    }
  }

  /**
   * Send prayer request follow-ups
   */
  async sendPrayerRequestFollowUps() {
    try {
      // Get prayer requests that have been pending for more than 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const pendingPrayerRequests = await PrayerRequest.find({
        status: 'pending',
        createdAt: { $lte: threeDaysAgo }
      }).populate('user', 'name email');

      console.log(`Found ${pendingPrayerRequests.length} prayer requests pending for more than 3 days`);

      for (const prayerRequest of pendingPrayerRequests) {
        if (prayerRequest.user && prayerRequest.user.email) {
          const result = await emailNotificationService.sendCustomNotification(
            prayerRequest.user,
            'Prayer Request Follow-up',
            `Your prayer request "${prayerRequest.title}" is still being prayed over. We will update you soon.`,
            `${process.env.FRONTEND_URL}/member/prayer-requests`,
            'View Prayer Requests'
          );

          console.log(`Prayer request follow-up sent to ${prayerRequest.user.email}: ${result.success}`);
        }
      }
    } catch (error) {
      console.error('Error sending prayer request follow-ups:', error);
    }
  }

  /**
   * Send monthly newsletter
   */
  async sendMonthlyNewsletter() {
    try {
      // Get all active users with emails
      const subscribers = await User.find({
        active: true,
        email: { $exists: true, $ne: '' },
        preferences: { $elemMatch: { type: 'newsletter', enabled: true } }
      });

      console.log(`Found ${subscribers.length} newsletter subscribers`);

      if (subscribers.length > 0) {
        // Get monthly statistics
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const monthlyStats = {
          newMembers: await User.countDocuments({
            createdAt: { $gte: lastMonth },
            role: 'member'
          }),
          newSermons: await Sermon.countDocuments({
            createdAt: { $gte: lastMonth },
            status: 'approved'
          }),
          newEvents: await Event.countDocuments({
            createdAt: { $gte: lastMonth },
            active: true
          })
        };

        // Send newsletter to each subscriber
        for (const subscriber of subscribers) {
          const result = await emailNotificationService.sendCustomNotification(
            subscriber,
            'Haven Word Church - Monthly Newsletter',
            `This month we welcomed ${monthlyStats.newMembers} new members, added ${monthlyStats.newSermons} new sermons, and planned ${monthlyStats.newEvents} events. Thank you for being part of our church family!`,
            `${process.env.FRONTEND_URL}/member/dashboard`,
            'View Dashboard'
          );

          console.log(`Newsletter sent to ${subscriber.email}: ${result.success}`);
        }
      }
    } catch (error) {
      console.error('Error sending monthly newsletter:', error);
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    console.log('🛑 Stopping all scheduled tasks...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`🛑 Stopped task: ${name}`);
    });
    this.tasks.clear();
  }

  /**
   * Get task status
   */
  getStatus() {
    const status = {};
    this.tasks.forEach((task, name) => {
      status[name] = {
        running: task.running,
        scheduled: task.scheduled
      };
    });
    return status;
  }
}

module.exports = new ScheduledTaskService(); 