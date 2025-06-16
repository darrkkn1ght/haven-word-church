/**
 * Shared Constants Configuration
 * Haven Word Church - Centralized Constants for Frontend & Backend
 * 
 * This file contains all shared constants used across the application
 * including user roles, statuses, validation rules, and configuration values
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

// =============================================================================
// USER ROLES & PERMISSIONS
// =============================================================================

/**
 * User roles hierarchy (lowest to highest privilege)
 * @type {Object}
 */
export const USER_ROLES = {
  GUEST: 'guest',
  MEMBER: 'member',
  VOLUNTEER: 'volunteer',
  LEADER: 'leader',
  PASTOR: 'pastor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

/**
 * Role hierarchy levels for permission checking
 * @type {Object}
 */
export const ROLE_HIERARCHY = {
  [USER_ROLES.GUEST]: 0,
  [USER_ROLES.MEMBER]: 1,
  [USER_ROLES.VOLUNTEER]: 2,
  [USER_ROLES.LEADER]: 3,
  [USER_ROLES.PASTOR]: 4,
  [USER_ROLES.ADMIN]: 5,
  [USER_ROLES.SUPER_ADMIN]: 6
};

/**
 * Permission groups for role-based access control
 * @type {Object}
 */
export const PERMISSIONS = {
  // Content Management
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  PUBLISH_CONTENT: 'publish_content',
  
  // User Management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Event Management
  CREATE_EVENTS: 'create_events',
  EDIT_EVENTS: 'edit_events',
  DELETE_EVENTS: 'delete_events',
  MANAGE_ATTENDANCE: 'manage_attendance',
  
  // Ministry Management
  CREATE_MINISTRIES: 'create_ministries',
  EDIT_MINISTRIES: 'edit_ministries',
  DELETE_MINISTRIES: 'delete_ministries',
  
  // System Administration
  SYSTEM_CONFIG: 'system_config',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_BACKUPS: 'manage_backups'
};

// =============================================================================
// CONTENT STATUS & TYPES
// =============================================================================

/**
 * Content publication status
 * @type {Object}
 */
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
};

/**
 * Event status types
 * @type {Object}
 */
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed'
};

/**
 * Event types for Nigerian church context
 * @type {Object}
 */
export const EVENT_TYPES = {
  SUNDAY_SERVICE: 'sunday_service',
  MIDWEEK_SERVICE: 'midweek_service',
  PRAYER_MEETING: 'prayer_meeting',
  BIBLE_STUDY: 'bible_study',
  FELLOWSHIP: 'fellowship',
  REVIVAL: 'revival',
  CRUSADE: 'crusade',
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  THANKSGIVING: 'thanksgiving',
  VIGIL: 'vigil',
  OUTREACH: 'outreach',
  WEDDING: 'wedding',
  FUNERAL: 'funeral',
  DEDICATION: 'dedication',
  SPECIAL_PROGRAM: 'special_program'
};

/**
 * Ministry categories
 * @type {Object}
 */
export const MINISTRY_TYPES = {
  CHILDREN: 'children',
  YOUTH: 'youth',
  YOUNG_ADULTS: 'young_adults',
  MEN: 'men',
  WOMEN: 'women',
  SENIORS: 'seniors',
  MUSIC: 'music',
  TECHNICAL: 'technical',
  USHERING: 'ushering',
  SECURITY: 'security',
  HOSPITALITY: 'hospitality',
  EVANGELISM: 'evangelism',
  WELFARE: 'welfare',
  MEDIA: 'media',
  COUNSELING: 'counseling',
  INTERCESSION: 'intercession'
};

/**
 * Sermon series and categories
 * @type {Object}
 */
export const SERMON_CATEGORIES = {
  SUNDAY_MESSAGE: 'sunday_message',
  MIDWEEK_TEACHING: 'midweek_teaching',
  REVIVAL_MESSAGE: 'revival_message',
  CONFERENCE_MESSAGE: 'conference_message',
  SPECIAL_OCCASION: 'special_occasion',
  SERIES: 'series',
  TOPICAL: 'topical',
  EXPOSITORY: 'expository',
  PROPHETIC: 'prophetic'
};

// =============================================================================
// ATTENDANCE & ENGAGEMENT
// =============================================================================

/**
 * Attendance status types
 * @type {Object}
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  PARTIAL: 'partial'
};

/**
 * RSVP status for events
 * @type {Object}
 */
export const RSVP_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  MAYBE: 'maybe',
  NO_RESPONSE: 'no_response'
};

// =============================================================================
// COMMUNICATION & CONTACT
// =============================================================================

/**
 * Contact message categories
 * @type {Object}
 */
export const CONTACT_CATEGORIES = {
  GENERAL_INQUIRY: 'general_inquiry',
  PRAYER_REQUEST: 'prayer_request',
  COUNSELING: 'counseling',
  MINISTRY_INTEREST: 'ministry_interest',
  TECHNICAL_SUPPORT: 'technical_support',
  FEEDBACK: 'feedback',
  COMPLAINT: 'complaint',
  TESTIMONIAL: 'testimonial',
  PARTNERSHIP: 'partnership',
  MEDIA_INQUIRY: 'media_inquiry'
};

/**
 * Contact message priority levels
 * @type {Object}
 */
export const MESSAGE_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Communication channels
 * @type {Object}
 */
export const COMMUNICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  PHONE_CALL: 'phone_call',
  IN_PERSON: 'in_person',
  WEBSITE: 'website',
  SOCIAL_MEDIA: 'social_media'
};

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/**
 * Field length limits
 * @type {Object}
 */
export const FIELD_LIMITS = {
  // User fields
  NAME_MIN: 2,
  NAME_MAX: 50,
  EMAIL_MAX: 255,
  PHONE_MAX: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  
  // Content fields
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  EXCERPT_MAX: 500,
  CONTENT_MAX: 50000,
  
  // Event fields
  EVENT_TITLE_MAX: 150,
  EVENT_DESCRIPTION_MAX: 2000,
  LOCATION_MAX: 200,
  
  // Message fields
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
  SUBJECT_MAX: 200
};

/**
 * File upload limits
 * @type {Object}
 */
export const FILE_LIMITS = {
  // Image files
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Audio files (for sermons)
  AUDIO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'],
  
  // Video files
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB
  VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/avi'],
  
  // Document files
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * API response status codes
 * @type {Object}
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Pagination defaults
 * @type {Object}
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  
  // Page sizes for different content types
  EVENTS_PER_PAGE: 12,
  SERMONS_PER_PAGE: 6,
  BLOG_POSTS_PER_PAGE: 9,
  MEMBERS_PER_PAGE: 20,
  MINISTRIES_PER_PAGE: 8
};

/**
 * Cache durations (in seconds)
 * @type {Object}
 */
export const CACHE_DURATION = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// =============================================================================
// NIGERIAN CONTEXT
// =============================================================================

/**
 * Nigerian states for location context
 * @type {Array<string>}
 */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

/**
 * Nigerian phone number patterns
 * @type {Object}
 */
export const PHONE_PATTERNS = {
  MOBILE_REGEX: /^(\+234|234|0)?[789][01]\d{8}$/,
  LANDLINE_REGEX: /^(\+234|234|0)?[1-9]\d{6,7}$/,
  INTERNATIONAL_REGEX: /^\+[1-9]\d{1,14}$/
};

/**
 * Nigerian currency formatting
 * @type {Object}
 */
export const CURRENCY = {
  CODE: 'NGN',
  SYMBOL: '₦',
  LOCALE: 'en-NG'
};

/**
 * Time zones for Nigeria
 * @type {Object}
 */
export const TIMEZONE = {
  NIGERIA: 'Africa/Lagos',
  UTC_OFFSET: '+01:00'
};

// =============================================================================
// APPLICATION SETTINGS
// =============================================================================

/**
 * Theme configuration
 * @type {Object}
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Language settings
 * @type {Object}
 */
export const LANGUAGES = {
  ENGLISH: 'en',
  YORUBA: 'yo',
  IGBO: 'ig',
  HAUSA: 'ha'
};

/**
 * Default application settings
 * @type {Object}
 */
export const DEFAULT_SETTINGS = {
  THEME: THEMES.LIGHT,
  LANGUAGE: LANGUAGES.ENGLISH,
  TIMEZONE: TIMEZONE.NIGERIA,
  NOTIFICATIONS_ENABLED: true,
  EMAIL_NOTIFICATIONS: true,
  SMS_NOTIFICATIONS: false
};

/**
 * Regular expressions for validation
 * @type {Object}
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: PHONE_PATTERNS.MOBILE_REGEX,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME: /^[a-zA-Z\s'-]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
};

/**
 * Date and time formats
 * @type {Object}
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMMM DD, YYYY',
  DISPLAY_DATETIME: 'MMMM DD, YYYY [at] h:mm A',
  INPUT_DATE: 'YYYY-MM-DD',
  INPUT_DATETIME: 'YYYY-MM-DDTHH:mm',
  TIME_ONLY: 'h:mm A',
  DAY_MONTH: 'MMM DD',
  FULL_DATE: 'dddd, MMMM DD, YYYY'
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * Common error messages
 * @type {Object}
 */
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  TOKEN_EXPIRED: 'Session has expired. Please login again',
  ACCESS_DENIED: 'Access denied. Insufficient permissions',
  ACCOUNT_DISABLED: 'Account has been disabled. Contact administrator',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Nigerian phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_REQUIREMENTS: 'Password must contain uppercase, lowercase, number and special character',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum allowed limit',
  INVALID_FILE_TYPE: 'File type not supported',
  UPLOAD_FAILED: 'File upload failed. Please try again',
  
  // Generic
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  NOT_FOUND: 'Requested resource not found',
  ALREADY_EXISTS: 'Resource already exists'
};

/**
 * Success messages
 * @type {Object}
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! Login successful',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  REGISTRATION_SUCCESS: 'Registration successful! Welcome to Haven Word Church',
  UPDATE_SUCCESS: 'Information updated successfully',
  DELETE_SUCCESS: 'Item deleted successfully',
  EMAIL_SENT: 'Email sent successfully',
  RSVP_CONFIRMED: 'Your RSVP has been confirmed',
  ATTENDANCE_MARKED: 'Attendance marked successfully'
};

// =============================================================================
// EXPORT COLLECTIONS
// =============================================================================

/**
 * Grouped exports for easier importing
 */
export const ROLES_AND_PERMISSIONS = {
  USER_ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS
};

export const CONTENT_TYPES = {
  CONTENT_STATUS,
  EVENT_STATUS,
  EVENT_TYPES,
  MINISTRY_TYPES,
  SERMON_CATEGORIES
};

export const VALIDATION_RULES = {
  FIELD_LIMITS,
  FILE_LIMITS,
  REGEX_PATTERNS
};

export const API_CONFIG = {
  HTTP_STATUS,
  PAGINATION,
  CACHE_DURATION
};

export const NIGERIAN_DATA = {
  NIGERIAN_STATES,
  PHONE_PATTERNS,
  CURRENCY,
  TIMEZONE
};

// Default export for CommonJS compatibility
module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  CONTENT_STATUS,
  EVENT_STATUS,
  EVENT_TYPES,
  MINISTRY_TYPES,
  SERMON_CATEGORIES,
  ATTENDANCE_STATUS,
  RSVP_STATUS,
  CONTACT_CATEGORIES,
  MESSAGE_PRIORITY,
  COMMUNICATION_CHANNELS,
  FIELD_LIMITS,
  FILE_LIMITS,
  HTTP_STATUS,
  PAGINATION,
  CACHE_DURATION,
  NIGERIAN_STATES,
  PHONE_PATTERNS,
  CURRENCY,
  TIMEZONE,
  THEMES,
  LANGUAGES,
  DEFAULT_SETTINGS,
  REGEX_PATTERNS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROLES_AND_PERMISSIONS,
  CONTENT_TYPES,
  VALIDATION_RULES,
  API_CONFIG,
  NIGERIAN_DATA
};