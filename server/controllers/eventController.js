const Event = require('../models/Event');
const { validationResult } = require('express-validator');

/**
 * Event Controller for Haven Word Church
 * Handles all event-related operations including CRUD, registration, and analytics
 * 
 * Features:
 * - Complete CRUD operations for events
 * - Event registration and capacity management
 * - Public and member-specific event queries
 * - Featured events and filtering
 * - Analytics and engagement tracking
 * - Nigerian timezone and cultural context
 */

/**
 * Get all published events with optional filtering
 * @route GET /api/events
 * @access Public
 */
const getAllEvents = async (req, res) => {
  try {
    const {
      category,
      type,
      status = 'published',
      featured,
      upcoming,
      past,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Build query object
    let query = {};
    
    // Status filter (public users only see published events)
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'published';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Event type filter
    if (type) {
      query.eventType = type;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Date filters
    const now = new Date();
    if (upcoming === 'true') {
      query.startDate = { $gte: now };
    } else if (past === 'true') {
      query.endDate = { $lt: now };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.venue': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort({ startDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single event by ID or slug
 * @route GET /api/events/:identifier
 * @access Public
 */
const getEvent = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let event = await Event.findById(identifier).catch(() => null);
    
    if (!event) {
      event = await Event.findOne({ slug: identifier });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can access this event
    if (event.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Populate creator information
    await event.populate('createdBy', 'firstName lastName');
    await event.populate('lastModifiedBy', 'firstName lastName');

    // Increment view count if this is a public view
    if (event.status === 'published') {
      await event.incrementViews();
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new event
 * @route POST /api/events
 * @access Private (Admin/Staff)
 */
const createEvent = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Create event with creator information
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    // Populate creator information
    await event.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });

  } catch (error) {
    console.error('Create event error:', error);
    
    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event with this title already exists for the same date'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update existing event
 * @route PUT /api/events/:id
 * @access Private (Admin/Staff)
 */
const updateEvent = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Populate creator and modifier information
    await event.populate('createdBy', 'firstName lastName');
    await event.populate('lastModifiedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });

  } catch (error) {
    console.error('Update event error:', error);
    
    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event with this title already exists for the same date'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete event
 * @route DELETE /api/events/:id
 * @access Private (Admin only)
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get featured events
 * @route GET /api/events/featured
 * @access Public
 */
const getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const events = await Event.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get upcoming events
 * @route GET /api/events/upcoming
 * @access Public
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const events = await Event.findUpcoming(parseInt(limit));

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Register for an event
 * @route POST /api/events/:id/register
 * @access Private (Member)
 */
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event allows registration
    if (!event.registration.isRequired && !event.registration.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event'
      });
    }

    // Check if registration is still open
    if (event.registration.deadline && new Date() > event.registration.deadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.registration.attendees.some(
      attendee => attendee.user.toString() === userId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check capacity
    if (event.capacity && event.registration.attendees.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    // Add user to attendees
    event.registration.attendees.push({
      user: userId,
      registeredAt: new Date(),
      status: 'registered'
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });

  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Unregister from an event
 * @route DELETE /api/events/:id/register
 * @access Private (Member)
 */
const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered
    const attendeeIndex = event.registration.attendees.findIndex(
      attendee => attendee.user.toString() === userId
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Remove user from attendees
    event.registration.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });

  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during unregistration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get event attendees (Admin only)
 * @route GET /api/events/:id/attendees
 * @access Private (Admin/Staff)
 */
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('registration.attendees.user', 'firstName lastName email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        eventTitle: event.title,
        totalAttendees: event.registration.attendees.length,
        capacity: event.capacity,
        attendees: event.registration.attendees
      }
    });

  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
  getUpcomingEvents,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees
};