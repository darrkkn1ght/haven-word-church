import { VALIDATION_RULES, UPLOAD_CONFIG } from './constants';
import { isValidEmail, isValidPhone, validatePassword } from './helpers';

// ====================
// BASIC VALIDATORS
// ====================

/**
 * Check if value is required (not empty)
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const required = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const minLength = (value, minLength, fieldName = 'This field') => {
  if (!value) return null; // Skip if empty (use required validator for that)
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const maxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) return null; // Skip if empty
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate minimum value
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const minValue = (value, min, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') return null;
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

/**
 * Validate maximum value
 * @param {number} value - Value to validate
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const maxValue = (value, max, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') return null;
  const numValue = Number(value);
  if (isNaN(numValue) || numValue > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return null;
};

// ====================
// PATTERN VALIDATORS
// ====================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null if valid
 */
export const email = (email) => {
  if (!email) return null; // Skip if empty
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null if valid
 */
export const phone = (phone) => {
  if (!phone) return null; // Skip if empty
  if (!isValidPhone(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null if valid
 */
export const password = (password) => {
  if (!password) return null; // Skip if empty
  
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return validation.requirements.join(', ');
  }
  return null;
};

/**
 * Validate password confirmation
 * @param {string} confirmPassword - Confirmation password
 * @param {string} originalPassword - Original password
 * @returns {string|null} Error message or null if valid
 */
export const confirmPassword = (confirmPassword, originalPassword) => {
  if (!confirmPassword) return null; // Skip if empty
  if (confirmPassword !== originalPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {string|null} Error message or null if valid
 */
export const url = (url) => {
  if (!url) return null; // Skip if empty
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

/**
 * Validate date format and range
 * @param {string} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const date = (date, options = {}) => {
  if (!date) return null; // Skip if empty
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  
  if (options.minDate) {
    const minDate = new Date(options.minDate);
    if (dateObj < minDate) {
      return `Date must be after ${minDate.toLocaleDateString()}`;
    }
  }
  
  if (options.maxDate) {
    const maxDate = new Date(options.maxDate);
    if (dateObj > maxDate) {
      return `Date must be before ${maxDate.toLocaleDateString()}`;
    }
  }
  
  if (options.futureOnly && dateObj <= new Date()) {
    return 'Date must be in the future';
  }
  
  if (options.pastOnly && dateObj >= new Date()) {
    return 'Date must be in the past';
  }
  
  return null;
};

// ====================
// FILE VALIDATORS
// ====================

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string|null} Error message or null if valid
 */
export const fileSize = (file, maxSize = UPLOAD_CONFIG.MAX_FILE_SIZE) => {
  if (!file) return null; // Skip if no file
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {string|null} Error message or null if valid
 */
export const fileType = (file, allowedTypes) => {
  if (!file) return null; // Skip if no file
  
  if (!allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(type => type.split('/')[1]).join(', ');
    return `Only ${types} files are allowed`;
  }
  return null;
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export const imageFile = (file) => {
  return fileType(file, UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES);
};

/**
 * Validate audio file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export const audioFile = (file) => {
  return fileType(file, UPLOAD_CONFIG.ALLOWED_AUDIO_TYPES);
};

/**
 * Validate video file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export const videoFile = (file) => {
  return fileType(file, UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES);
};

/**
 * Validate document file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export const documentFile = (file) => {
  return fileType(file, UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES);
};

// ====================
// CHURCH-SPECIFIC VALIDATORS
// ====================

/**
 * Validate name (first/last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const name = (name, fieldName = 'Name') => {
  const requiredError = required(name, fieldName);
  if (requiredError) return requiredError;
  
  const minLengthError = minLength(name, VALIDATION_RULES.NAME_MIN_LENGTH, fieldName);
  if (minLengthError) return minLengthError;
  
  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
};

/**
 * Validate church member ID
 * @param {string} memberId - Member ID to validate
 * @returns {string|null} Error message or null if valid
 */
export const memberId = (memberId) => {
  if (!memberId) return null; // Skip if empty
  
  // Assuming format: HWC-YYYY-NNNN (e.g., HWC-2024-0001)
  if (!/^HWC-\d{4}-\d{4}$/.test(memberId)) {
    return 'Member ID must be in format HWC-YYYY-NNNN';
  }
  return null;
};

/**
 * Validate age
 * @param {number} age - Age to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const age = (age, options = {}) => {
  if (age === null || age === undefined || age === '') return null;
  
  const numAge = Number(age);
  if (isNaN(numAge) || numAge < 0 || numAge > 150) {
    return 'Please enter a valid age';
  }
  
  if (options.minAge && numAge < options.minAge) {
    return `Age must be at least ${options.minAge}`;
  }
  
  if (options.maxAge && numAge > options.maxAge) {
    return `Age must not exceed ${options.maxAge}`;
  }
  
  return null;
};

/**
 * Validate donation amount
 * @param {number} amount - Amount to validate
 * @returns {string|null} Error message or null if valid
 */
export const donationAmount = (amount) => {
  const requiredError = required(amount, 'Donation amount');
  if (requiredError) return requiredError;
  
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Donation amount must be greater than $0';
  }
  
  if (numAmount > 10000) {
    return 'For donations over $10,000, please contact the church office';
  }
  
  return null;
};

/**
 * Validate event capacity
 * @param {number} capacity - Capacity to validate
 * @returns {string|null} Error message or null if valid
 */
export const eventCapacity = (capacity) => {
  if (!capacity) return null; // Skip if empty (unlimited capacity)
  
  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity < 1) {
    return 'Event capacity must be at least 1';
  }
  
  if (numCapacity > 10000) {
    return 'Event capacity seems unusually high. Please verify.';
  }
  
  return null;
};

// ====================
// FORM VALIDATORS
// ====================

/**
 * Validate contact form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateContactForm = (formData) => {
  const errors = {};
  
  const nameError = name(formData.name, 'Name');
  if (nameError) errors.name = nameError;
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  else if (!formData.email) errors.email = 'Email is required';
  
  const phoneError = phone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const messageError = required(formData.message, 'Message');
  if (messageError) errors.message = messageError;
  else {
    const minLengthError = minLength(formData.message, VALIDATION_RULES.MESSAGE_MIN_LENGTH, 'Message');
    if (minLengthError) errors.message = minLengthError;
  }
  
  return errors;
};

/**
 * Validate registration form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  const firstNameError = name(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = name(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  else if (!formData.email) errors.email = 'Email is required';
  
  const passwordError = password(formData.password);
  if (passwordError) errors.password = passwordError;
  else if (!formData.password) errors.password = 'Password is required';
  
  const confirmPasswordError = confirmPassword(formData.confirmPassword, formData.password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  else if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  
  const phoneError = phone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const ageError = age(formData.age, { minAge: 13 });
  if (ageError) errors.age = ageError;
  
  return errors;
};

/**
 * Validate login form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  else if (!formData.email) errors.email = 'Email is required';
  
  if (!formData.password) errors.password = 'Password is required';
  
  return errors;
};

/**
 * Validate event form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateEventForm = (formData) => {
  const errors = {};
  
  const titleError = required(formData.title, 'Event title');
  if (titleError) errors.title = titleError;
  else {
    const maxLengthError = maxLength(formData.title, VALIDATION_RULES.TITLE_MAX_LENGTH, 'Event title');
    if (maxLengthError) errors.title = maxLengthError;
  }
  
  const descriptionError = required(formData.description, 'Event description');
  if (descriptionError) errors.description = descriptionError;
  else {
    const maxLengthError = maxLength(formData.description, VALIDATION_RULES.DESCRIPTION_MAX_LENGTH, 'Event description');
    if (maxLengthError) errors.description = maxLengthError;
  }
  
  const dateError = date(formData.date, { futureOnly: true });
  if (dateError) errors.date = dateError;
  else if (!formData.date) errors.date = 'Event date is required';
  
  const capacityError = eventCapacity(formData.capacity);
  if (capacityError) errors.capacity = capacityError;
  
  return errors;
};

/**
 * Validate prayer request form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validatePrayerRequestForm = (formData) => {
  const errors = {};
  
  const nameError = name(formData.name, 'Name');
  if (nameError) errors.name = nameError;
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  
  const requestError = required(formData.request, 'Prayer request');
  if (requestError) errors.request = requestError;
  else {
    const minLengthError = minLength(formData.request, VALIDATION_RULES.MESSAGE_MIN_LENGTH, 'Prayer request');
    if (minLengthError) errors.request = minLengthError;
  }
  
  return errors;
};

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Validate single field with multiple validators
 * @param {any} value - Value to validate
 * @param {Array} validators - Array of validator functions
 * @returns {string|null} First error message or null if valid
 */
export const validateField = (value, validators) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate entire form object
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Validation rules object
 * @returns {Object} Validation errors object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const validators = validationRules[field];
    const value = formData[field];
    const error = validateField(value, validators);
    if (error) errors[field] = error;
  });
  
  return errors;
};

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message from errors object
 * @param {Object} errors - Errors object
 * @returns {string|null} First error message
 */
export const getFirstError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

// Export all validators
export default {
  // Basic validators
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  
  // Pattern validators
  email,
  phone,
  password,
  confirmPassword,
  url,
  date,
  
  // File validators
  fileSize,
  fileType,
  imageFile,
  audioFile,
  videoFile,
  documentFile,
  
  // Church-specific validators
  name,
  memberId,
  age,
  donationAmount,
  eventCapacity,
  
  // Form validators
  validateContactForm,
  validateRegistrationForm,
  validateLoginForm,
  validateEventForm,
  validatePrayerRequestForm,
  
  // Utility functions
  validateField,
  validateForm,
  hasErrors,
  getFirstError,
};