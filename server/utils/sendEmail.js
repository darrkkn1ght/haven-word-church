const nodemailer = require('nodemailer');

/**
 * Email sending utility for Haven Word Church
 * Handles all email communications with proper error handling
 */

// Create transporter based on environment
let transporter;

/**
 * Initialize email transporter
 * @returns {Promise<void>}
 */
const initializeTransporter = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Production: Use actual email service
      transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development: Use Ethereal Email for testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    // Verify transporter
    await transporter.verify();
    console.log('📧 Email transporter initialized successfully');

  } catch (error) {
    console.error('❌ Email transporter initialization failed:', error.message);
    throw new Error(`Email transporter initialization failed: ${error.message}`);
  }
};

/**
 * Send email with retry mechanism
 * @param {Object} mailOptions - Email options
 * @param {string} mailOptions.to - Recipient email
 * @param {string} mailOptions.subject - Email subject
 * @param {string} mailOptions.text - Plain text content
 * @param {string} mailOptions.html - HTML content
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} Email send result
 */
const sendEmail = async (mailOptions, retries = 3) => {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      await initializeTransporter();
    }

    // Validate required fields
    if (!mailOptions.to) {
      throw new Error('Recipient email is required');
    }

    if (!mailOptions.subject) {
      throw new Error('Email subject is required');
    }

    if (!mailOptions.text && !mailOptions.html) {
      throw new Error('Email content (text or html) is required');
    }

    // Set default from address
    const defaultMailOptions = {
      from: `"Haven Word Church" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      ...mailOptions
    };

    // Send email
    const result = await transporter.sendMail(defaultMailOptions);

    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent successfully');
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return {
      success: true,
      messageId: result.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(result) : null
    };

  } catch (error) {
    console.error(`❌ Email send failed (${retries} retries left):`, error.message);
    
    // Retry mechanism
    if (retries > 0) {
      console.log(`🔄 Retrying email send in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendEmail(mailOptions, retries - 1);
    }

    throw new Error(`Email send failed after all retries: ${error.message}`);
  }
};

/**
 * Send welcome email to new members
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>} Email send result
 */
const sendWelcomeEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    to: email,
    subject: '🙏 Welcome to Haven Word Church Family!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; margin-bottom: 10px;">Haven Word Church</h1>
          <p style="color: #666; font-style: italic;">"Faith • Hope • Love"</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">Welcome, ${firstName}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We are thrilled to welcome you to the Haven Word Church family! Your journey of faith with us begins now.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            To complete your registration and access member-only features, please verify your email address:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #2c5aa0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${verificationUrl}" style="color: #2c5aa0;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-bottom: 15px;">What's Next? 📋</h3>
          <ul style="color: #856404; line-height: 1.8;">
            <li>Join us for Sunday Service at 9:00 AM</li>
            <li>Explore our ministries and find your calling</li>
            <li>Connect with fellow members in our community</li>
            <li>Stay updated with church events and programs</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 10px;">
            📍 Located in the heart of Nigeria<br>
            📧 Contact us: info@havenwordchurch.org<br>
            📞 Phone: +234-xxx-xxx-xxxx
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This email was sent to ${email}. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    to: email,
    subject: '🔐 Password Reset Request - Haven Word Church',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; margin-bottom: 10px;">Haven Word Church</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hello ${firstName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We received a request to reset your password for your Haven Word Church account. 
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #dc3545;">${resetUrl}</a>
          </p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ This link will expire in 1 hour for security purposes.
            </p>
          </div>
        </div>
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #0c5460; margin: 0; font-size: 14px;">
            <strong>Didn't request this?</strong> Your account is safe. You can ignore this email, 
            and your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            For security reasons, we cannot send your existing password. 
            This email was sent to ${email}.
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send event notification email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {Object} event - Event details
 * @returns {Promise<Object>} Email send result
 */
const sendEventNotificationEmail = async (email, firstName, event) => {
  const eventDate = new Date(event.date).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Lagos'
  });

  const eventTime = new Date(event.date).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos'
  });
  
  const mailOptions = {
    to: email,
    subject: `📅 Upcoming Event: ${event.title} - Haven Word Church`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; margin-bottom: 10px;">Haven Word Church</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">${event.title}</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hello ${firstName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We're excited to remind you about our upcoming event:
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
            <h3 style="color: #2c5aa0; margin-top: 0;">${event.title}</h3>
            <p style="color: #666; margin: 10px 0;">📅 <strong>Date:</strong> ${eventDate}</p>
            <p style="color: #666; margin: 10px 0;">🕐 <strong>Time:</strong> ${eventTime}</p>
            <p style="color: #666; margin: 10px 0;">📍 <strong>Location:</strong> ${event.location || 'Church Premises'}</p>
            <p style="color: #333; margin: 15px 0; line-height: 1.6;">${event.description}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="background: #28a745; color: white; padding: 15px; border-radius: 5px; margin: 0; font-weight: bold;">
              We can't wait to see you there! 🙏
            </p>
          </div>
        </div>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #155724; margin: 0; font-size: 14px;">
            <strong>Need directions or have questions?</strong> Contact our church office or reply to this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This event notification was sent to ${email}.<br>
            To update your notification preferences, please contact us.
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send contact form auto-response email
 * @param {string} email - Recipient email
 * @param {string} name - Contact person's name
 * @param {string} originalMessage - Their original message
 * @returns {Promise<Object>} Email send result
 */
const sendContactAutoResponse = async (email, name, originalMessage) => {
  const mailOptions = {
    to: email,
    subject: '🙏 Thank you for contacting Haven Word Church',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; margin-bottom: 10px;">Haven Word Church</h1>
          <p style="color: #666; font-style: italic;">"We're here for you"</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">Thank You for Reaching Out! 🙏</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Dear ${name},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We have received your message and want to thank you for taking the time to contact Haven Word Church. 
            Your communication is important to us, and we will respond as soon as possible.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #155724; margin-top: 0;">Your Message:</h4>
            <p style="color: #333; line-height: 1.6; font-style: italic;">"${originalMessage}"</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            A member of our team will review your message and get back to you within 24-48 hours. 
            In the meantime, please feel free to explore our website or join us for our services.
          </p>
        </div>
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #0c5460; margin-top: 0;">Visit Us 🏛️</h3>
          <p style="color: #0c5460; margin: 5px 0;">📅 <strong>Sunday Service:</strong> 9:00 AM</p>
          <p style="color: #0c5460; margin: 5px 0;">📅 <strong>Wednesday Bible Study:</strong> 6:00 PM</p>
          <p style="color: #0c5460; margin: 5px 0;">📍 <strong>Location:</strong> Haven Word Church, Nigeria</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This automated response was sent to ${email}.<br>
            Please do not reply to this email. For urgent matters, call our church office.
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send notification email to church staff
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @param {Object} data - Additional data to include
 * @returns {Promise<Object>} Email send result
 */
const sendStaffNotification = async (subject, message, data = {}) => {
  const staffEmail = process.env.STAFF_EMAIL || process.env.EMAIL_USER;
  
  const mailOptions = {
    to: staffEmail,
    subject: `[Haven Word Church] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; margin-bottom: 10px;">Haven Word Church</h1>
          <p style="color: #666; font-style: italic;">Staff Notification</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">${subject}</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${message}
          </p>
          
          ${Object.keys(data).length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
              <h4 style="color: #2c5aa0; margin-top: 0;">Additional Information:</h4>
              ${Object.entries(data).map(([key, value]) => `
                <p style="color: #333; margin: 5px 0;"><strong>${key}:</strong> ${value}</p>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from the Haven Word Church system.<br>
            Generated on ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEventNotificationEmail,
  sendContactAutoResponse,
  sendStaffNotification,
  initializeTransporter
};