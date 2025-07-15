const { sendEmail } = require('../config/email');
const User = require('../models/User');

/**
 * Email Notification Service
 * Handles sending email notifications for various church events and updates
 */

class EmailNotificationService {
  /**
   * Send prayer request status update email
   */
  async sendPrayerRequestUpdate(prayerRequest, status, adminResponse = null) {
    try {
      const user = await User.findById(prayerRequest.user);
      if (!user || !user.email) {
        console.log('User not found or no email for prayer request update');
        return { success: false, error: 'User not found or no email' };
      }

      const templateData = {
        memberName: user.name,
        prayerRequest: {
          title: prayerRequest.title,
          message: prayerRequest.message
        },
        status: status,
        adminResponse: adminResponse,
        dashboardUrl: `${process.env.FRONTEND_URL}/member/prayer-requests`,
        churchLogo: `${process.env.FRONTEND_URL}/logo.jpeg`
      };

      const result = await sendEmail({
        to: user.email,
        subject: `Prayer Request Update - ${prayerRequest.title}`,
        template: 'prayer-request-update',
        templateData
      });

      console.log(`Prayer request update email sent to ${user.email}:`, result.success);
      return result;
    } catch (error) {
      console.error('Error sending prayer request update email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send event reminder email
   */
  async sendEventReminder(event, user, rsvpStatus = null) {
    try {
      if (!user.email) {
        console.log('No email for event reminder');
        return { success: false, error: 'No email address' };
      }

      const templateData = {
        memberName: user.name,
        event: {
          title: event.title,
          date: new Date(event.date).toLocaleDateString('en-NG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: event.time || 'TBD',
          location: event.location || 'Church Auditorium',
          description: event.description
        },
        rsvpStatus: rsvpStatus,
        eventUrl: `${process.env.FRONTEND_URL}/events/${event._id}`,
        rsvpUrl: `${process.env.FRONTEND_URL}/events/${event._id}#rsvp`,
        churchLogo: `${process.env.FRONTEND_URL}/logo.jpeg`
      };

      const result = await sendEmail({
        to: user.email,
        subject: `Event Reminder: ${event.title} - Tomorrow`,
        template: 'event-reminder',
        templateData
      });

      console.log(`Event reminder email sent to ${user.email}:`, result.success);
      return result;
    } catch (error) {
      console.error('Error sending event reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new sermon notification email
   */
  async sendNewSermonNotification(sermon, subscribers) {
    try {
      if (!subscribers || subscribers.length === 0) {
        console.log('No subscribers for sermon notification');
        return { success: false, error: 'No subscribers' };
      }

      const templateData = {
        sermon: {
          title: sermon.title,
          speaker: sermon.speaker,
          date: new Date(sermon.date).toLocaleDateString('en-NG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          scripture: sermon.scripture,
          description: sermon.description,
          duration: sermon.duration || 'N/A',
          views: sermon.views || 0,
          downloads: sermon.downloads || 0
        },
        sermonUrl: `${process.env.FRONTEND_URL}/sermons/${sermon._id}`,
        downloadUrl: sermon.audioUrl || `${process.env.FRONTEND_URL}/sermons/${sermon._id}`,
        churchLogo: `${process.env.FRONTEND_URL}/logo.jpeg`
      };

      const emailPromises = subscribers.map(subscriber => 
        sendEmail({
          to: subscriber.email,
          subject: `New Sermon: ${sermon.title} - Haven Word Church`,
          template: 'new-sermon',
          templateData: {
            ...templateData,
            memberName: subscriber.name
          }
        })
      );

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      console.log(`Sermon notification emails sent: ${successful} successful, ${failed} failed`);
      return { success: true, sent: successful, failed };
    } catch (error) {
      console.error('Error sending sermon notification emails:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new members
   */
  async sendWelcomeEmail(user) {
    try {
      if (!user.email) {
        console.log('No email for welcome email');
        return { success: false, error: 'No email address' };
      }

      const templateData = {
        memberName: user.name,
        membershipDate: new Date().toLocaleDateString('en-NG'),
        nextServiceDate: this.getNextServiceDate(),
        pastorName: 'Pastor Anthonia',
        dashboardUrl: `${process.env.FRONTEND_URL}/member/dashboard`,
        churchLogo: `${process.env.FRONTEND_URL}/logo.jpeg`
      };

      const result = await sendEmail({
        to: user.email,
        subject: 'Welcome to Haven Word Church Family! 🙏',
        template: 'welcome',
        templateData
      });

      console.log(`Welcome email sent to ${user.email}:`, result.success);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk event reminders
   */
  async sendBulkEventReminders(event, users) {
    try {
      const emailPromises = users.map(user => 
        this.sendEventReminder(event, user)
      );

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      console.log(`Bulk event reminders sent: ${successful} successful, ${failed} failed`);
      return { success: true, sent: successful, failed };
    } catch (error) {
      console.error('Error sending bulk event reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get next service date (Sundays)
   */
  getNextServiceDate() {
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    
    return nextSunday.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Send custom notification email
   */
  async sendCustomNotification(user, subject, message, actionUrl = null, actionText = null) {
    try {
      if (!user.email) {
        console.log('No email for custom notification');
        return { success: false, error: 'No email address' };
      }

      const templateData = {
        memberName: user.name,
        message: message,
        actionUrl: actionUrl,
        actionText: actionText,
        churchLogo: `${process.env.FRONTEND_URL}/logo.jpeg`
      };

      const result = await sendEmail({
        to: user.email,
        subject: subject,
        template: 'custom-notification',
        templateData
      });

      console.log(`Custom notification email sent to ${user.email}:`, result.success);
      return result;
    } catch (error) {
      console.error('Error sending custom notification email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailNotificationService(); 