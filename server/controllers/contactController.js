const Contact = require('../models/Contact');
const User = require('../models/User');

/**
 * Contact Controller for Haven Word Church
 * Handles all contact form submissions, prayer requests, and inquiries
 * 
 * @description Manages contact operations including creation, assignment, response, and analytics
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

/**
 * Create a new contact submission
 * @route POST /api/contacts
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      contactType,
      priority,
      location,
      preferredLanguage,
      allowPublicPrayer,
      isPrivate,
      consentToContact,
      referralSource,
      tags
    } = req.body;

    // Validate required consent
    if (!consentToContact) {
      return res.status(400).json({
        success: false,
        message: 'Consent to contact is required to submit this form'
      });
    }

    // Create contact with metadata
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      contactType: contactType || 'general_inquiry',
      priority: priority || 'normal',
      location,
      preferredLanguage: preferredLanguage || 'english',
      allowPublicPrayer: allowPublicPrayer || false,
      isPrivate: isPrivate || false,
      consentToContact,
      referralSource: referralSource || 'website',
      tags: tags || [],
      
      // Technical metadata
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const contact = new Contact(contactData);
    await contact.save();

    // Auto-assign based on contact type (if staff members exist)
    await autoAssignContact(contact);

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
      data: {
        id: contact._id,
        status: contact.status,
        contactType: contact.contactType,
        priority: contact.priority
      }
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.'
    });
  }
};

/**
 * Get all contacts with filtering and pagination
 * @route GET /api/contacts
 * @access Private (Staff only)
 */
const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      contactType,
      priority,
      assignedTo,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (contactType) filter.contactType = contactType;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const contacts = await Contact.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'firstName lastName email role')
      .populate('respondedBy', 'firstName lastName email')
      .select('-internalNotes -ipAddress -userAgent'); // Exclude sensitive data for general staff

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
};

/**
 * Get single contact by ID
 * @route GET /api/contacts/:id
 * @access Private (Staff only)
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('respondedBy', 'firstName lastName email')
      .populate('internalNotes.addedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check if contact is private and user has permission
    if (contact.isPrivate && !hasPrivateContactAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private contact'
      });
    }

    // Mark as read if status is new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact details'
    });
  }
};

/**
 * Update contact status and assignment
 * @route PUT /api/contacts/:id
 * @access Private (Staff only)
 */
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignedTo,
      priority,
      followUpRequired,
      followUpDate,
      tags,
      responseMessage
    } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check permissions for private contacts
    if (contact.isPrivate && !hasPrivateContactAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private contact'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (assignedTo !== undefined) contact.assignedTo = assignedTo;
    if (priority) contact.priority = priority;
    if (followUpRequired !== undefined) contact.followUpRequired = followUpRequired;
    if (followUpDate) contact.followUpDate = new Date(followUpDate);
    if (tags) contact.tags = tags;

    // Handle response
    if (responseMessage) {
      contact.responseMessage = responseMessage;
      contact.respondedBy = req.user.id;
      contact.responseDate = new Date();
      if (contact.status === 'read' || contact.status === 'in_progress') {
        contact.status = 'responded';
      }
    }

    await contact.save();

    const updatedContact = await Contact.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('respondedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact'
    });
  }
};

/**
 * Add internal note to contact
 * @route POST /api/contacts/:id/notes
 * @access Private (Staff only)
 */
const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check permissions for private contacts
    if (contact.isPrivate && !hasPrivateContactAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private contact'
      });
    }

    await contact.addInternalNote(note.trim(), req.user.id);

    const updatedContact = await Contact.findById(id)
      .populate('internalNotes.addedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Internal note added successfully',
      data: {
        internalNotes: updatedContact.internalNotes
      }
    });

  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add internal note'
    });
  }
};

/**
 * Assign contact to staff member
 * @route PUT /api/contacts/:id/assign
 * @access Private (Admin/Pastor only)
 */
const assignContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Verify assignee exists and has appropriate role
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || !['admin', 'pastor', 'staff'].includes(assignee.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff member for assignment'
        });
      }
    }

    await contact.assignTo(assignedTo);

    const updatedContact = await Contact.findById(id)
      .populate('assignedTo', 'firstName lastName email role');

    res.json({
      success: true,
      message: assignedTo ? 'Contact assigned successfully' : 'Contact unassigned successfully',
      data: updatedContact
    });

  } catch (error) {
    console.error('Error assigning contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign contact'
    });
  }
};

/**
 * Get contact statistics and analytics
 * @route GET /api/contacts/stats
 * @access Private (Admin/Pastor only)
 */
const getContactStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Basic stats
    const basicStats = await Contact.getContactStats();

    // Recent stats
    const recentStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          recentTotal: { $sum: 1 },
          recentPrayerRequests: {
            $sum: { $cond: [{ $eq: ['$contactType', 'prayer_request'] }, 1, 0] }
          },
          recentGeneralInquiries: {
            $sum: { $cond: [{ $eq: ['$contactType', 'general_inquiry'] }, 1, 0] }
          }
        }
      }
    ]);

    // Contact type distribution
    const typeDistribution = await Contact.aggregate([
      {
        $group: {
          _id: '$contactType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Response time analytics
    const responseAnalytics = await Contact.aggregate([
      {
        $match: {
          responseDate: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$responseDate', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          totalResponded: { $sum: 1 }
        }
      }
    ]);

    // Overdue contacts
    const overdueContacts = await Contact.getOverdueContacts();

    res.json({
      success: true,
      data: {
        basic: basicStats,
        recent: recentStats[0] || { recentTotal: 0, recentPrayerRequests: 0, recentGeneralInquiries: 0 },
        typeDistribution,
        responseAnalytics: responseAnalytics[0] || { avgResponseTime: 0, totalResponded: 0 },
        overdueCount: overdueContacts.length,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};

/**
 * Get overdue contacts
 * @route GET /api/contacts/overdue
 * @access Private (Staff only)
 */
const getOverdueContacts = async (req, res) => {
  try {
    const { days = 3 } = req.query;
    
    const overdueContacts = await Contact.getOverdueContacts(parseInt(days));

    res.json({
      success: true,
      data: {
        contacts: overdueContacts,
        count: overdueContacts.length,
        days: parseInt(days)
      }
    });

  } catch (error) {
    console.error('Error fetching overdue contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue contacts'
    });
  }
};

/**
 * Delete contact (Admin only)
 * @route DELETE /api/contacts/:id
 * @access Private (Admin only)
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await Contact.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
};

/**
 * Auto-assign contact based on type and available staff
 * @param {Object} contact - Contact document
 */
const autoAssignContact = async (contact) => {
  try {
    let targetRole = 'staff';
    
    // Determine appropriate role based on contact type
    switch (contact.contactType) {
      case 'pastoral_care':
      case 'prayer_request':
        targetRole = 'pastor';
        break;
      case 'ministry_inquiry':
      case 'volunteer_interest':
        targetRole = 'staff';
        break;
      default:
        targetRole = 'staff';
    }

    // Find available staff member with the target role
    const availableStaff = await User.find({
      role: { $in: [targetRole, 'admin'] },
      isActive: true
    }).sort({ createdAt: 1 }); // Oldest first for fair distribution

    if (availableStaff.length > 0) {
      // Simple round-robin assignment (in production, you might want more sophisticated logic)
      const randomIndex = Math.floor(Math.random() * availableStaff.length);
      await contact.assignTo(availableStaff[randomIndex]._id);
    }

  } catch (error) {
    console.error('Error in auto-assignment:', error);
    // Don't throw error, just log it - contact creation should succeed even if assignment fails
  }
};

/**
 * Check if user has access to private contacts
 * @param {Object} user - User object
 * @returns {boolean} - Has access or not
 */
const hasPrivateContactAccess = (user) => {
  return ['admin', 'pastor'].includes(user.role);
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  addInternalNote,
  assignContact,
  getContactStats,
  getOverdueContacts,
  deleteContact
};