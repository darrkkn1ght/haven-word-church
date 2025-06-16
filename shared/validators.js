/**
 * Shared Validation Library
 * Haven Word Church - Centralized Validation Functions
 * 
 * This module provides comprehensive validation functions that can be used
 * across both frontend and backend to ensure data consistency and integrity
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

// Import constants (adjust path based on usage)
const {
  FIELD_LIMITS,
  FILE_LIMITS,
  REGEX_PATTERNS,
  USER_ROLES,
  EVENT_TYPES,
  MINISTRY_TYPES,
  CONTACT_CATEGORIES,
  NIGERIAN_STATES,
  ERROR_MESSAGES
} = require('./constants');

// =============================================================================
// CORE VALIDATION UTILITIES
// =============================================================================

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string|null} error - Error message if validation failed
 * @property {*} value - Sanitized/processed value
 */

/**
 * Creates a validation result object
 * @param {boolean} isValid - Validation status
 * @param {string|null} error - Error message
 * @param {*} value - Processed value
 * @returns {ValidationResult}
 */
const createValidationResult = (isValid, error = null, value = null) => ({
  isValid,
  error,
  value
});

/**
 * Sanitizes string input by trimming and removing extra spaces
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// =============================================================================
// BASIC FIELD VALIDATORS
// =============================================================================

/**
 * Validates required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {ValidationResult}
 */
const validateRequired = (value, fieldName = 'Field') => {
  if (isEmpty(value)) {
    return createValidationResult(false, `${fieldName} is required`);
  }
  return createValidationResult(true, null, value);
};

/**
 * Validates string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error messages
 * @returns {ValidationResult}
 */
const validateStringLength = (value, min, max, fieldName = 'Field') => {
  const sanitized = sanitizeString(value);
  
  if (sanitized.length < min) {
    return createValidationResult(false, `${fieldName} must be at least ${min} characters long`);
  }
  
  if (sanitized.length > max) {
    return createValidationResult(false, `${fieldName} must not exceed ${max} characters`);
  }
  
  return createValidationResult(true, null, sanitized);
};

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {ValidationResult}
 */
const validateEmail = (email) => {
  const sanitized = sanitizeString(email).toLowerCase();
  
  if (isEmpty(sanitized)) {
    return createValidationResult(false, ERROR_MESSAGES.REQUIRED_FIELD);
  }
  
  if (sanitized.length > FIELD_LIMITS.EMAIL_MAX) {
    return createValidationResult(false, `Email must not exceed ${FIELD_LIMITS.EMAIL_MAX} characters`);
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(sanitized)) {
    return createValidationResult(false, ERROR_MESSAGES.INVALID_EMAIL);
  }
  
  return createValidationResult(true, null, sanitized);
};

/**
 * Validates Nigerian phone number
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult}
 */
const validatePhone = (phone) => {
  const sanitized = sanitizeString(phone).replace(/[\s-()]/g, '');
  
  if (isEmpty(sanitized)) {
    return createValidationResult(false, 'Phone number is required');
  }
  
  if (!REGEX_PATTERNS.PHONE.test(sanitized)) {
    return createValidationResult(false, ERROR_MESSAGES.INVALID_PHONE);
  }
  
  // Normalize to international format
  let normalized = sanitized;
  if (normalized.startsWith('0')) {
    normalized = '+234' + normalized.substring(1);
  } else if (normalized.startsWith('234')) {
    normalized = '+' + normalized;
  } else if (!normalized.startsWith('+')) {
    normalized = '+234' + normalized;
  }
  
  return createValidationResult(true, null, normalized);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {ValidationResult}
 */
const validatePassword = (password) => {
  if (isEmpty(password)) {
    return createValidationResult(false, 'Password is required');
  }
  
  if (password.length < FIELD_LIMITS.PASSWORD_MIN) {
    return createValidationResult(false, ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  }
  
  if (password.length > FIELD_LIMITS.PASSWORD_MAX) {
    return createValidationResult(false, `Password must not exceed ${FIELD_LIMITS.PASSWORD_MAX} characters`);
  }
  
  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    return createValidationResult(false, ERROR_MESSAGES.PASSWORD_REQUIREMENTS);
  }
  
  return createValidationResult(true, null, password);
};

/**
 * Validates name field (first name, last name, etc.)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {ValidationResult}
 */
const validateName = (name, fieldName = 'Name') => {
  const lengthValidation = validateStringLength(name, FIELD_LIMITS.NAME_MIN, FIELD_LIMITS.NAME_MAX, fieldName);
  if (!lengthValidation.isValid) return lengthValidation;
  
  if (!REGEX_PATTERNS.NAME.test(lengthValidation.value)) {
    return createValidationResult(false, `${fieldName} can only contain letters, spaces, hyphens and apostrophes`);
  }
  
  return createValidationResult(true, null, lengthValidation.value);
};

// =============================================================================
// CONTENT VALIDATORS
// =============================================================================

/**
 * Validates blog/content title
 * @param {string} title - Title to validate
 * @returns {ValidationResult}
 */
const validateTitle = (title) => {
  return validateStringLength(title, FIELD_LIMITS.TITLE_MIN, FIELD_LIMITS.TITLE_MAX, 'Title');
};

/**
 * Validates content body (blog posts, event descriptions, etc.)
 * @param {string} content - Content to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {ValidationResult}
 */
const validateContent = (content, fieldName = 'Content') => {
  const sanitized = sanitizeString(content);
  
  if (sanitized.length > FIELD_LIMITS.CONTENT_MAX) {
    return createValidationResult(false, `${fieldName} must not exceed ${FIELD_LIMITS.CONTENT_MAX} characters`);
  }
  
  return createValidationResult(true, null, sanitized);
};

/**
 * Validates excerpt/summary
 * @param {string} excerpt - Excerpt to validate
 * @returns {ValidationResult}
 */
const validateExcerpt = (excerpt) => {
  const sanitized = sanitizeString(excerpt);
  
  if (sanitized.length > FIELD_LIMITS.EXCERPT_MAX) {
    return createValidationResult(false, `Excerpt must not exceed ${FIELD_LIMITS.EXCERPT_MAX} characters`);
  }
  
  return createValidationResult(true, null, sanitized);
};

// =============================================================================
// EVENT VALIDATORS
// =============================================================================

/**
 * Validates event data
 * @param {Object} eventData - Event data to validate
 * @returns {Object} Validation results for all fields
 */
const validateEvent = (eventData) => {
  const results = {};
  
  // Validate title
  results.title = validateStringLength(
    eventData.title, 
    FIELD_LIMITS.TITLE_MIN, 
    FIELD_LIMITS.EVENT_TITLE_MAX, 
    'Event title'
  );
  
  // Validate description
  results.description = validateStringLength(
    eventData.description, 
    0, 
    FIELD_LIMITS.EVENT_DESCRIPTION_MAX, 
    'Event description'
  );
  
  // Validate event type
  results.eventType = validateEventType(eventData.eventType);
  
  // Validate date
  results.date = validateFutureDate(eventData.date);
  
  // Validate location
  results.location = validateStringLength(
    eventData.location, 
    1, 
    FIELD_LIMITS.LOCATION_MAX, 
    'Location'
  );
  
  // Check overall validity
  const isValid = Object.values(results).every(result => result.isValid);
  
  return {
    isValid,
    fields: results,
    data: isValid ? {
      title: results.title.value,
      description: results.description.value,
      eventType: results.eventType.value,
      date: results.date.value,
      location: results.location.value
    } : null
  };
};

/**
 * Validates event type
 * @param {string} eventType - Event type to validate
 * @returns {ValidationResult}
 */
const validateEventType = (eventType) => {
  if (isEmpty(eventType)) {
    return createValidationResult(false, 'Event type is required');
  }
  
  if (!Object.values(EVENT_TYPES).includes(eventType)) {
    return createValidationResult(false, 'Invalid event type');
  }
  
  return createValidationResult(true, null, eventType);
};

/**
 * Validates future date
 * @param {string|Date} date - Date to validate
 * @returns {ValidationResult}
 */
const validateFutureDate = (date) => {
  if (isEmpty(date)) {
    return createValidationResult(false, 'Date is required');
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return createValidationResult(false, 'Invalid date format');
  }
  
  const now = new Date();
  if (dateObj <= now) {
    return createValidationResult(false, 'Date must be in the future');
  }
  
  return createValidationResult(true, null, dateObj);
};

// =============================================================================
// USER VALIDATORS
// =============================================================================

/**
 * Validates user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation results for all fields
 */
const validateUserRegistration = (userData) => {
  const results = {};
  
  // Validate first name
  results.firstName = validateName(userData.firstName, 'First name');
  
  // Validate last name
  results.lastName = validateName(userData.lastName, 'Last name');
  
  // Validate email
  results.email = validateEmail(userData.email);
  
  // Validate phone
  results.phone = validatePhone(userData.phone);
  
  // Validate password
  results.password = validatePassword(userData.password);
  
  // Validate password confirmation
  results.confirmPassword = validatePasswordConfirmation(userData.password, userData.confirmPassword);
  
  // Validate role (if provided)
  if (userData.role) {
    results.role = validateUserRole(userData.role);
  }
  
  // Check overall validity
  const isValid = Object.values(results).every(result => result.isValid);
  
  return {
    isValid,
    fields: results,
    data: isValid ? {
      firstName: results.firstName.value,
      lastName: results.lastName.value,
      email: results.email.value,
      phone: results.phone.value,
      password: results.password.value,
      role: results.role ? results.role.value : USER_ROLES.MEMBER
    } : null
  };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {ValidationResult}
 */
const validatePasswordConfirmation = (password, confirmPassword) => {
  if (isEmpty(confirmPassword)) {
    return createValidationResult(false, 'Password confirmation is required');
  }
  
  if (password !== confirmPassword) {
    return createValidationResult(false, 'Passwords do not match');
  }
  
  return createValidationResult(true, null, confirmPassword);
};

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @returns {ValidationResult}
 */
const validateUserRole = (role) => {
  if (!Object.values(USER_ROLES).includes(role)) {
    return createValidationResult(false, 'Invalid user role');
  }
  
  return createValidationResult(true, null, role);
};

// =============================================================================
// CONTACT & MESSAGE VALIDATORS
// =============================================================================

/**
 * Validates contact form data
 * @param {Object} contactData - Contact data to validate
 * @returns {Object} Validation results for all fields
 */
const validateContactForm = (contactData) => {
  const results = {};
  
  // Validate name
  results.name = validateName(contactData.name, 'Full name');
  
  // Validate email
  results.email = validateEmail(contactData.email);
  
  // Validate phone (optional)
  if (contactData.phone && !isEmpty(contactData.phone)) {
    results.phone = validatePhone(contactData.phone);
  }
  
  // Validate subject
  results.subject = validateStringLength(
    contactData.subject, 
    FIELD_LIMITS.TITLE_MIN, 
    FIELD_LIMITS.SUBJECT_MAX, 
    'Subject'
  );
  
  // Validate message
  results.message = validateStringLength(
    contactData.message, 
    FIELD_LIMITS.MESSAGE_MIN, 
    FIELD_LIMITS.MESSAGE_MAX, 
    'Message'
  );
  
  // Validate category
  results.category = validateContactCategory(contactData.category);
  
  // Check overall validity
  const isValid = Object.values(results).every(result => result.isValid);
  
  return {
    isValid,
    fields: results,
    data: isValid ? {
      name: results.name.value,
      email: results.email.value,
      phone: results.phone ? results.phone.value : null,
      subject: results.subject.value,
      message: results.message.value,
      category: results.category.value
    } : null
  };
};

/**
 * Validates contact category
 * @param {string} category - Category to validate
 * @returns {ValidationResult}
 */
const validateContactCategory = (category) => {
  if (isEmpty(category)) {
    return createValidationResult(false, 'Category is required');
  }
  
  if (!Object.values(CONTACT_CATEGORIES).includes(category)) {
    return createValidationResult(false, 'Invalid contact category');
  }
  
  return createValidationResult(true, null, category);
};

// =============================================================================
// FILE VALIDATORS
// =============================================================================

/**
 * Validates file upload
 * @param {File|Object} file - File to validate
 * @param {string} fileType - Expected file type (image, audio, video, document)
 * @returns {ValidationResult}
 */
const validateFile = (file, fileType = 'image') => {
  if (!file) {
    return createValidationResult(false, 'File is required');
  }
  
  // Get file limits based on type
  let maxSize, allowedTypes;
  
  switch (fileType) {
    case 'image':
      maxSize = FILE_LIMITS.IMAGE_MAX_SIZE;
      allowedTypes = FILE_LIMITS.IMAGE_TYPES;
      break;
    case 'audio':
      maxSize = FILE_LIMITS.AUDIO_MAX_SIZE;
      allowedTypes = FILE_LIMITS.AUDIO_TYPES;
      break;
    case 'video':
      maxSize = FILE_LIMITS.VIDEO_MAX_SIZE;
      allowedTypes = FILE_LIMITS.VIDEO_TYPES;
      break;
    case 'document':
      maxSize = FILE_LIMITS.DOCUMENT_MAX_SIZE;
      allowedTypes = FILE_LIMITS.DOCUMENT_TYPES;
      break;
    default:
      return createValidationResult(false, 'Invalid file type specified');
  }
  
  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return createValidationResult(false, `File size must not exceed ${maxSizeMB}MB`);
  }
  
  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    return createValidationResult(false, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return createValidationResult(true, null, file);
};

// =============================================================================
// UTILITY VALIDATORS
// =============================================================================

/**
 * Validates Nigerian state
 * @param {string} state - State to validate
 * @returns {ValidationResult}
 */
const validateNigerianState = (state) => {
  if (isEmpty(state)) {
    return createValidationResult(false, 'State is required');
  }
  
  if (!NIGERIAN_STATES.includes(state)) {
    return createValidationResult(false, 'Invalid Nigerian state');
  }
  
  return createValidationResult(true, null, state);
};

/**
 * Validates URL
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {ValidationResult}
 */
const validateUrl = (url, required = false) => {
  if (isEmpty(url)) {
    if (required) {
      return createValidationResult(false, 'URL is required');
    }
    return createValidationResult(true, null, null);
  }
  
  const sanitized = sanitizeString(url);
  
  if (!REGEX_PATTERNS.URL.test(sanitized)) {
    return createValidationResult(false, 'Invalid URL format');
  }
  
  return createValidationResult(true, null, sanitized);
};

/**
 * Validates ministry type
 * @param {string} ministryType - Ministry type to validate
 * @returns {ValidationResult}
 */
const validateMinistryType = (ministryType) => {
  if (isEmpty(ministryType)) {
    return createValidationResult(false, 'Ministry type is required');
  }
  
  if (!Object.values(MINISTRY_TYPES).includes(ministryType)) {
    return createValidationResult(false, 'Invalid ministry type');
  }
  
  return createValidationResult(true, null, ministryType);
};

// =============================================================================
// BATCH VALIDATORS
// =============================================================================

/**
 * Validates multiple fields at once
 * @param {Object} data - Data object to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
const validateFields = (data, rules) => {
  const results = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && isEmpty(value)) {
      results[field] = createValidationResult(false, `${rule.label || field} is required`);
      continue;
    }
    
    if (!isEmpty(value) && rule.validator) {
      results[field] = rule.validator(value, rule.options);
    } else {
      results[field] = createValidationResult(true, null, value);
    }
  }
  
  const isValid = Object.values(results).every(result => result.isValid);
  
  return {
    isValid,
    fields: results,
    errors: Object.entries(results)
      .filter(([, result]) => !result.isValid)
      .reduce((acc, [field, result]) => {
        acc[field] = result.error;
        return acc;
      }, {})
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Core utilities
  createValidationResult,
  sanitizeString,
  isEmpty,
  
  // Basic validators
  validateRequired,
  validateStringLength,
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  
  // Content validators
  validateTitle,
  validateContent,
  validateExcerpt,
  
  // Event validators
  validateEvent,
  validateEventType,
  validateFutureDate,
  
  // User validators
  validateUserRegistration,
  validatePasswordConfirmation,
  validateUserRole,
  
  // Contact validators
  validateContactForm,
  validateContactCategory,
  
  // File validators
  validateFile,
  
  // Utility validators
  validateNigerianState,
  validateUrl,
  validateMinistryType,
  
  // Batch validators
  validateFields
};

// ES6 export for frontend compatibility
if (typeof window !== 'undefined') {
  window.HavenValidators = module.exports;
}