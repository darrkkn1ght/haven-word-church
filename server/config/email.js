const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Configuration for Haven Word Church
 * Handles transactional emails, newsletters, and notifications
 * Optimized for Nigerian email providers and church communications
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

/**
 * Email service configuration
 * Supports multiple providers with fallback options
 */
const EMAIL_PROVIDERS = {
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS // Use App Password for Gmail
    }
  },
  outlook: {
    service: 'hotmail',
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS
    }
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  }
};

/**
 * Church email addresses configuration
 */
const CHURCH_EMAILS = {
  main: process.env.CHURCH_MAIN_EMAIL || 'info@havenwordchurch.org',
  pastor: process.env.CHURCH_PASTOR_EMAIL || 'pastor@havenwordchurch.org',
  admin: process.env.CHURCH_ADMIN_EMAIL || 'admin@havenwordchurch.org',
  prayer: process.env.CHURCH_PRAYER_EMAIL || 'prayer@havenwordchurch.org',
  events: process.env.CHURCH_EVENTS_EMAIL || 'events@havenwordchurch.org',
  noreply: process.env.CHURCH_NOREPLY_EMAIL || 'noreply@havenwordchurch.org'
};

/**
 * Email templates directory
 */
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

/**
 * Create email transporter with fallback support
 * Tries multiple providers until one works
 * 
 * @returns {Promise<Object>} Nodemailer transporter
 */
const createTransporter = async () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';
  
  if (!EMAIL_PROVIDERS[provider]) {
    throw new Error(`Email provider '${provider}' not supported`);
  }
  
  const config = EMAIL_PROVIDERS[provider];
  
  try {
    const transporter = nodemailer.createTransporter(config);
    
    // Verify connection
    await transporter.verify();
    console.log(`✅ Email configured with ${provider}`);
    
    return transporter;
  } catch (error) {
    console.error(`❌ Failed to configure ${provider}:`, error.message);
    
    // Try fallback providers
    const fallbackProviders = Object.keys(EMAIL_PROVIDERS).filter(p => p !== provider);
    
    for (const fallback of fallbackProviders) {
      try {
        const fallbackConfig = EMAIL_PROVIDERS[fallback];
        const fallbackTransporter = nodemailer.createTransporter(fallbackConfig);
        
        await fallbackTransporter.verify();
        console.log(`✅ Email configured with fallback ${fallback}`);
        
        return fallbackTransporter;
      } catch (fallbackError) {
        console.error(`❌ Fallback ${fallback} failed:`, fallbackError.message);
        continue;
      }
    }
    
    throw new Error('All email providers failed');
  }
};

/**
 * Load and compile email template
 * 
 * @param {string} templateName - Template filename without extension
 * @param {Object} data - Template data
 * @returns {Promise<string>} Compiled HTML
 */
const loadTemplate = async (templateName, data = {}) => {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    
    // Add common church data
    const templateData = {
      ...data,
      churchName: 'Haven Word Church',
      churchAddress: 'Lagos, Nigeria',
      churchPhone: process.env.CHURCH_PHONE || '+234-XXX-XXXX-XXX',
      churchEmail: CHURCH_EMAILS.main,
      currentYear: new Date().getFullYear(),
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`
    };
    
    return template(templateData);
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found or invalid`);
  }
};

/**
 * Send email with template support
 * 
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (options) => {
  try {
    const {
      to,
      subject,
      template = null,
      templateData = {},
      html = null,
      text = null,
      from = CHURCH_EMAILS.noreply,
      cc = null,
      bcc = null,
      attachments = []
    } = options;
    
    const transporter = await createTransporter();
    
    let emailHtml = html;
    let emailText = text;
    
    // Use template if provided
    if (template) {
      emailHtml = await loadTemplate(template, templateData);
      // Generate plain text from HTML if not provided
      if (!emailText) {
        emailText = emailHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      }
    }
    
    const mailOptions = {
      from: `Haven Word Church <${from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: emailHtml,
      text: emailText,
      attachments
    };
    
    if (cc) mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
    if (bcc) mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
    
    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Pre-configured email functions for common church communications
 */

/**
 * Send welcome email to new members
 * 
 * @param {string} email - Member email
 * @param {Object} memberData - Member information
 * @returns {Promise<Object>} Send result
 */
const sendWelcomeEmail = async (email, memberData) => {
  return await sendEmail({
    to: email,
    subject: 'Welcome to Haven Word Church Family! 🙏',
    template: 'welcome',
    templateData: {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      membershipDate: new Date().toLocaleDateString('en-NG'),
      nextServiceDate: getNextServiceDate(),
      pastorName: 'Pastor [Name]'
    }
  });
};

/**
 * Send contact form notification
 * 
 * @param {Object} contactData - Contact form data
 * @returns {Promise<Object>} Send result
 */
const sendContactNotification = async (contactData) => {
  // Send to admin
  const adminResult = await sendEmail({
    to: CHURCH_EMAILS.admin,
    subject: `New Contact Form Submission - ${contactData.subject}`,
    template: 'contact-notification',
    templateData: contactData
  });
  
  // Send confirmation to sender
  const confirmationResult = await sendEmail({
    to: contactData.email,
    subject: 'Thank you for contacting Haven Word Church',
    template: 'contact-confirmation',
    templateData: {
      firstName: contactData.firstName,
      expectedResponse: '24-48 hours'
    }
  });
  
  return {
    adminNotification: adminResult,
    userConfirmation: confirmationResult
  };
};

/**
 * Send prayer request notification
 * 
 * @param {Object} prayerRequest - Prayer request data
 * @returns {Promise<Object>} Send result
 */
const sendPrayerRequestNotification = async (prayerRequest) => {
  // Send to prayer team
  const prayerTeamResult = await sendEmail({
    to: CHURCH_EMAILS.prayer,
    subject: 'New Prayer Request Submitted',
    template: 'prayer-request',
    templateData: {
      ...prayerRequest,
      isUrgent: prayerRequest.urgent || false,
      submittedAt: new Date().toLocaleString('en-NG')
    }
  });
  
  // Send confirmation to requester
  const confirmationResult = await sendEmail({
    to: prayerRequest.email,
    subject: 'Your Prayer Request - Haven Word Church',
    template: 'prayer-confirmation',
    templateData: {
      firstName: prayerRequest.firstName,
      isAnonymous: prayerRequest.anonymous || false
    }
  });
  
  return {
    prayerTeamNotification: prayerTeamResult,
    userConfirmation: confirmationResult
  };
};

/**
 * Send event reminder email
 * 
 * @param {string} email - Recipient email
 * @param {Object} eventData - Event information
 * @returns {Promise<Object>} Send result
 */
const sendEventReminder = async (email, eventData) => {
  return await sendEmail({
    to: email,
    subject: `Reminder: ${eventData.title} - Tomorrow!`,
    template: 'event-reminder',
    templateData: {
      ...eventData,
      eventDate: new Date(eventData.date).toLocaleDateString('en-NG'),
      eventTime: new Date(eventData.date).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  });
};

/**
 * Send weekly newsletter
 * 
 * @param {Array<string>} subscribers - Email list
 * @param {Object} newsletterData - Newsletter content
 * @returns {Promise<Array>} Send results
 */
const sendNewsletter = async (subscribers, newsletterData) => {
  const results = [];
  
  // Send in batches to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    const batchPromises = batch.map(email => 
      sendEmail({
        to: email,
        subject: `Haven Word Church Newsletter - ${newsletterData.title}`,
        template: 'newsletter',
        templateData: newsletterData,
        bcc: CHURCH_EMAILS.admin // BCC admin for tracking
      })
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches
    if (i + batchSize < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * Send password reset email
 * 
 * @param {string} email - User email
 * @param {Object} resetData - Reset token and user data
 * @returns {Promise<Object>} Send result
 */
const sendPasswordReset = async (email, resetData) => {
  return await sendEmail({
    to: email,
    subject: 'Password Reset - Haven Word Church',
    template: 'password-reset',
    templateData: {
      firstName: resetData.firstName,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetData.token}`,
      expiresIn: '1 hour'
    }
  });
};

/**
 * Send sermon notification
 * 
 * @param {Array<string>} subscribers - Subscriber emails
 * @param {Object} sermonData - Sermon information
 * @returns {Promise<Array>} Send results
 */
const sendSermonNotification = async (subscribers, sermonData) => {
  const results = [];
  const batchSize = 50;
  
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    const batchPromises = batch.map(email => 
      sendEmail({
        to: email,
        subject: `New Sermon Available: ${sermonData.title}`,
        template: 'sermon-notification',
        templateData: {
          ...sermonData,
          sermonUrl: `${process.env.FRONTEND_URL}/sermons/${sermonData.slug}`,
          preacher: sermonData.preacher || 'Pastor [Name]'
        }
      })
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting
    if (i + batchSize < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * Utility functions
 */

/**
 * Get next service date (assuming Sunday services)
 * 
 * @returns {string} Next service date
 */
const getNextServiceDate = () => {
  const today = new Date();
  const nextSunday = new Date();
  nextSunday.setDate(today.getDate() + (7 - today.getDay()));
  return nextSunday.toLocaleDateString('en-NG');
};

/**
 * Validate email address
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Health check for email service
 * 
 * @returns {Promise<Object>} Health status
 */
const healthCheck = async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    
    return {
      status: 'healthy',
      provider: process.env.EMAIL_PROVIDER || 'gmail',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Create default email templates directory
 */
const ensureTemplatesDirectory = async () => {
  try {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    console.log(`✅ Email templates directory ready: ${TEMPLATES_DIR}`);
  } catch (error) {
    console.error('Error creating templates directory:', error);
  }
};

// Initialize templates directory
ensureTemplatesDirectory();

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendContactNotification,
  sendPrayerRequestNotification,
  sendEventReminder,
  sendNewsletter,
  sendPasswordReset,
  sendSermonNotification,
  loadTemplate,
  isValidEmail,
  healthCheck,
  CHURCH_EMAILS,
  createTransporter
};