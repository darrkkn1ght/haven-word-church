// Application Constants for Haven Word Church

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  RECENT_SEARCHES: 'recent_searches',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Haven Word Church',
  TAGLINE: 'The Spread City',
  VERSION: '1.0.0',
  AUTHOR: 'Haven Word Church Development Team',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Event Types
export const EVENT_TYPES = {
  SUNDAY_SERVICE: 'sunday_service',
  BIBLE_STUDY: 'bible_study',
  PRAYER_MEETING: 'prayer_meeting',
  YOUTH_SERVICE: 'youth_service',
  WOMENS_MEETING: 'womens_meeting',
  MENS_MEETING: 'mens_meeting',
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  OUTREACH: 'outreach',
  FELLOWSHIP: 'fellowship',
  SPECIAL_EVENT: 'special_event',
  CHILDREN_PROGRAM: 'children_program',
};

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  POSTPONED: 'postponed',
};

// Ministry Categories
export const MINISTRY_CATEGORIES = {
  WORSHIP: 'worship',
  YOUTH: 'youth',
  CHILDREN: 'children',
  WOMENS: 'womens',
  MENS: 'mens',
  SENIORS: 'seniors',
  OUTREACH: 'outreach',
  DISCIPLESHIP: 'discipleship',
  MISSIONS: 'missions',
  PRAYER: 'prayer',
  MEDIA: 'media',
  HOSPITALITY: 'hospitality',
};

// Sermon Categories
export const SERMON_CATEGORIES = {
  SUNDAY_MESSAGE: 'sunday_message',
  BIBLE_STUDY: 'bible_study',
  TOPICAL: 'topical',
  SERIES: 'series',
  SPECIAL_OCCASION: 'special_occasion',
  GUEST_SPEAKER: 'guest_speaker',
};

// Blog Categories
export const BLOG_CATEGORIES = {
  ANNOUNCEMENTS: 'announcements',
  TESTIMONIES: 'testimonies',
  DEVOTIONALS: 'devotionals',
  CHURCH_NEWS: 'church_news',
  COMMUNITY: 'community',
  EVENTS: 'events',
  MINISTRY_UPDATES: 'ministry_updates',
};

// Prayer Request Categories
export const PRAYER_CATEGORIES = {
  HEALING: 'healing',
  FAMILY: 'family',
  FINANCES: 'finances',
  GUIDANCE: 'guidance',
  SALVATION: 'salvation',
  RELATIONSHIPS: 'relationships',
  WORK: 'work',
  TRAVEL: 'travel',
  PRAISE: 'praise',
  OTHER: 'other',
};

export const PRAYER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PRAYING: 'praying',
  ANSWERED: 'answered',
  ARCHIVED: 'archived',
};

// Donation Types
export const DONATION_TYPES = {
  TITHE: 'tithe',
  OFFERING: 'offering',
  BUILDING_FUND: 'building_fund',
  MISSIONS: 'missions',
  SPECIAL_PROJECT: 'special_project',
  LOVE_OFFERING: 'love_offering',
  THANKSGIVING: 'thanksgiving',
};

// Contact Form Types
export const CONTACT_TYPES = {
  GENERAL_INQUIRY: 'general_inquiry',
  PASTORAL_CARE: 'pastoral_care',
  PRAYER_REQUEST: 'prayer_request',
  VOLUNTEER: 'volunteer',
  MEMBERSHIP: 'membership',
  FEEDBACK: 'feedback',
  TECHNICAL_SUPPORT: 'technical_support',
};

// File Upload Constants
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// UI Constants
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 12,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 80,
};

// Theme Colors (matches Tailwind config)
export const THEME_COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },
  SECONDARY: {
    50: '#fefce8',
    100: '#fef3c7',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    900: '#713f12',
  },
  ACCENT: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  MESSAGE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
};

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: 'yyyy-MM-dd\'T\'HH:mm',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
  HUMAN_READABLE: 'EEEE, MMMM do, yyyy',
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: process.env.REACT_APP_FACEBOOK_URL || '#',
  INSTAGRAM: process.env.REACT_APP_INSTAGRAM_URL || '#',
  YOUTUBE: process.env.REACT_APP_YOUTUBE_URL || '#',
  TWITTER: process.env.REACT_APP_TWITTER_URL || '#',
};

// Church Information
export const CHURCH_INFO = {
  NAME: 'Haven Word Church',
  ADDRESS: process.env.REACT_APP_CHURCH_ADDRESS || '123 Faith Street, City, State 12345',
  PHONE: process.env.REACT_APP_CHURCH_PHONE || '+1-555-123-4567',
  EMAIL: process.env.REACT_APP_CHURCH_EMAIL || 'info@havenwordchurch.org',
  WEBSITE: process.env.REACT_APP_BASE_URL || 'https://havenwordchurch.org',
};

// Service Times (default - can be overridden by admin)
export const DEFAULT_SERVICE_TIMES = {
  SUNDAY_MORNING: '10:00 AM',
  SUNDAY_EVENING: '6:00 PM',
  WEDNESDAY_BIBLE_STUDY: '7:00 PM',
  FRIDAY_PRAYER: '6:00 PM',
};

// Feature Flags
export const FEATURES = {
  LIVE_STREAMING: process.env.REACT_APP_ENABLE_LIVE_STREAMING === 'true',
  ONLINE_GIVING: process.env.REACT_APP_ENABLE_ONLINE_GIVING === 'true',
  EVENT_REGISTRATION: process.env.REACT_APP_ENABLE_EVENT_REGISTRATION === 'true',
  PRAYER_REQUESTS: process.env.REACT_APP_ENABLE_PRAYER_REQUESTS === 'true',
  BLOG: true,
  NEWSLETTER: true,
  NOTIFICATIONS: true,
};

// Error Messages (authentication-related removed)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages (authentication-related removed)
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  EMAIL_SENT: 'Email sent successfully!',
  FORM_SUBMITTED: 'Your form has been submitted successfully.',
  EVENT_REGISTERED: 'You have been successfully registered for the event.',
  PRAYER_SUBMITTED: 'Your prayer request has been submitted.',
  DONATION_SUCCESS: 'Thank you for your generous donation!',
};

// Ministries List (shared between Ministries page and Footer)
export const MINISTRIES_LIST = [
  {
    id: 1,
    title: 'Haven Teens and Children Mission',
    category: 'children',
    tags: ['children', 'teens'],
    description: 'Helping teens and children grow in Christ through fun, interactive activities.',
    fullDescription: 'Helping teens and children grow in Christ through fun, interactive activities. We provide a safe and engaging environment for spiritual growth and friendship.',
    image: '/api/placeholder/600/400',
    leader: '',
    contact: { phone: '', email: '' },
    meetingTime: '',
    location: '',
    ageGroup: 'Children & Teens',
    members: null,
    activities: [
      'Bible Stories',
      'Worship Songs',
      'Games',
      'Arts & Crafts'
    ],
    upcomingEvents: []
  },
  {
    id: 2,
    title: 'Church Planting Mission',
    category: 'outreach',
    tags: ['outreach', 'all ages'],
    description: 'Spreading the gospel through new church plants and outreach efforts.',
    fullDescription: 'Spreading the gospel through new church plants and outreach efforts. We are passionate about reaching new communities for Christ.',
    image: '/api/placeholder/600/400',
    leader: '',
    contact: { phone: '', email: '' },
    meetingTime: '',
    location: '',
    ageGroup: 'All ages',
    members: null,
    activities: [
      'Evangelism',
      'Community Service',
      'Discipleship Training'
    ],
    upcomingEvents: []
  },
  {
    id: 3,
    title: 'Flames Mission',
    category: 'youth',
    tags: ['youth', 'teens'],
    description: 'Raising a generation of passionate, on-fire youths for Christ.',
    fullDescription: 'Raising a generation of passionate, on-fire youths for Christ. We empower young people to lead and serve with zeal.',
    image: '/api/placeholder/600/400',
    leader: '',
    contact: { phone: '', email: '' },
    meetingTime: '',
    location: '',
    ageGroup: 'Teens & Youth',
    members: null,
    activities: [
      'Youth Services',
      'Prayer Meetings',
      'Leadership Training'
    ],
    upcomingEvents: []
  },
  {
    id: 4,
    title: 'Campus Fellowship Mission',
    category: 'fellowship',
    tags: ['students', 'young adults'],
    description: 'Bringing Christ to the campuses and empowering students.',
    fullDescription: 'Bringing Christ to the campuses and empowering students. We foster spiritual growth and mentorship for students and young adults.',
    image: '/api/placeholder/600/400',
    leader: '',
    contact: { phone: '', email: '' },
    meetingTime: '',
    location: '',
    ageGroup: 'Students & Young Adults',
    members: null,
    activities: [
      'Campus Bible Study',
      'Worship Nights',
      'Mentorship'
    ],
    upcomingEvents: []
  },
  {
    id: 5,
    title: 'Anagkazo Mission',
    category: 'outreach',
    tags: ['evangelism', 'all ages'],
    description: 'A mission focused on aggressive evangelism and soul winning.',
    fullDescription: 'A mission focused on aggressive evangelism and soul winning. We are committed to reaching the lost through various outreach events.',
    image: '/api/placeholder/600/400',
    leader: '',
    contact: { phone: '', email: '' },
    meetingTime: '',
    location: '',
    ageGroup: 'All ages',
    members: null,
    activities: [
      'Street Preaching',
      'Gospel Campaigns',
      'Outreach Events'
    ],
    upcomingEvents: []
  }
];

const constants = {
  APP_CONFIG,
  API_CONFIG,
  EVENT_TYPES,
  EVENT_STATUS,
  MINISTRY_CATEGORIES,
  SERMON_CATEGORIES,
  BLOG_CATEGORIES,
  PRAYER_CATEGORIES,
  PRAYER_STATUS,
  DONATION_TYPES,
  CONTACT_TYPES,
  UPLOAD_CONFIG,
  UI_CONFIG,
  THEME_COLORS,
  VALIDATION_RULES,
  DATE_FORMATS,
  SOCIAL_LINKS,
  CHURCH_INFO,
  DEFAULT_SERVICE_TIMES,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

export default constants;
