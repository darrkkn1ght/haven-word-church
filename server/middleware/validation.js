/**
 * Comprehensive Validation System for Haven Word Church
 * Handles form validation, data sanitization, and security checks
 * Optimized for Nigerian context and church-specific requirements
 * 
 * Features:
 * - Email and phone validation for Nigerian formats
 * - Church-specific data validation (member info, donations, etc.)
 * - Security validation (XSS, SQL injection prevention)
 * - File upload validation
 * - Multi-language error messages (English/Yoruba/Hausa/Igbo)
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const moment = require('moment-timezone');

/**
 * Nigerian-specific validation patterns
 */
const PATTERNS = {
  // Nigerian phone numbers (various formats)
  nigerianPhone: /^(\+234|234|0)?[789][01]\d{8}$/,
  
  // Common Nigerian names pattern
  nigerianName: /^[a-zA-Z\s'-]{2,50}$/,
  
  // Church member ID format
  memberID: /^HWC\d{6}$/,
  
  // Nigerian postal codes
  postalCode: /^\d{6}$/,
  
  // Strong password with Nigerian context
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Bible verse reference
  bibleVerse: /^[1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?$/,
  
  // Nigerian bank account number
  bankAccount: /^\d{10}$/,
  
  // Church department codes
  departmentCode: /^(YOUTH|ADULT|CHILD|CHOIR|USHER|MEDIA|ADMIN)$/
};

/**
 * Nigerian states for address validation
 */
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

/**
 * Church-specific validation rules
 */
const CHURCH_RULES = {
  membershipTypes: ['Member', 'Worker', 'Leader', 'Pastor', 'Guest'],
  genderOptions: ['Male', 'Female'],
  maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'],
  departments: ['Youth', 'Adult', 'Children', 'Choir', 'Ushering', 'Media', 'Administration'],
  donationTypes: ['Tithe', 'Offering', 'Special Seed', 'Building Fund', 'Mission', 'Other'],
  prayerCategories: ['Personal', 'Family', 'Health', 'Financial', 'Ministry', 'National', 'Other']
};

/**
 * Error messages in multiple languages
 */
const ERROR_MESSAGES = {
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid Nigerian phone number',
    name: 'Please enter a valid name (2-50 characters)',
    password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    confirmPassword: 'Passwords do not match',
    date: 'Please enter a valid date',
    amount: 'Please enter a valid amount',
    age: 'Age must be between 1 and 120',
    memberID: 'Member ID must be in format HWC123456',
    bibleVerse: 'Please enter a valid Bible verse reference (e.g., John 3:16)',
    fileSize: 'File size must be less than 5MB',
    fileType: 'Invalid file type'
  },
  yo: { // Yoruba
    required: 'A nilo yi',
    email: 'E fi adiresi imeeli to pe si',
    phone: 'E fi nọmba foonu ti o pe si',
    name: 'E fi oruko to pe si (2-50 lẹta)',
    password: 'Ọrọ igbaniwọle gbọdọ ni o kere ju lẹta 8',
    age: 'Ọjọ ori gbọdọ wa laarin 1 ati 120'
  },
  ha: { // Hausa
    required: 'Ana bukata wannan',
    email: 'Ka shigar da ingantaccen adireshin imel',
    phone: 'Ka shigar da ingantaccen lambar waya ta Najeriya',
    name: 'Ka shigar da ingantaccen suna (2-50 haruffa)'
  },
  ig: { // Igbo
    required: 'A chọrọ nke a',
    email: 'Tinye adreesị email ziri ezi',
    phone: 'Tinye nọmba ekwentị Nigerian ziri ezi',
    name: 'Tinye aha ziri ezi (2-50 mkpụrụedemede)'
  }
};

/**
 * Main validation class
 */
class ChurchValidator {
  constructor(language = 'en') {
    this.language = language;
    this.errors = [];
    this.timezone = 'Africa/Lagos';
  }

  /**
   * Get error message in current language
   */
  getMessage(key, fallback) {
    return ERROR_MESSAGES[this.language]?.[key] || 
           ERROR_MESSAGES.en[key] || 
           fallback || 
           'Invalid input';
  }

  /**
   * Clear validation errors
   */
  clearErrors() {
    this.errors = [];
    return this;
  }

  /**
   * Add validation error
   */
  addError(field, message) {
    this.errors.push({ field, message });
    return this;
  }

  /**
   * Check if validation passed
   */
  isValid() {
    return this.errors.length === 0;
  }

  /**
   * Get all validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get errors for specific field
   */
  getFieldErrors(field) {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Basic validation methods
   */

  /**
   * Validate required field
   */
  required(value, field) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.addError(field, this.getMessage('required'));
      return false;
    }
    return true;
  }

  /**
   * Validate email address
   */
  email(value, field) {
    if (!value) return true; // Allow empty if not required
    
    if (!validator.isEmail(value) || value.length > 100) {
      this.addError(field, this.getMessage('email'));
      return false;
    }
    return true;
  }

  /**
   * Validate Nigerian phone number
   */
  phone(value, field) {
    if (!value) return true;
    
    // Remove spaces and hyphens
    const cleanPhone = value.replace(/[\s-]/g, '');
    
    if (!PATTERNS.nigerianPhone.test(cleanPhone)) {
      this.addError(field, this.getMessage('phone'));
      return false;
    }
    return true;
  }

  /**
   * Validate name (Nigerian context)
   */
  name(value, field) {
    if (!value) return true;
    
    if (!PATTERNS.nigerianName.test(value) || value.length < 2 || value.length > 50) {
      this.addError(field, this.getMessage('name'));
      return false;
    }
    return true;
  }

  /**
   * Validate password strength
   */
  password(value, field) {
    if (!value) return true;
    
    if (!PATTERNS.strongPassword.test(value)) {
      this.addError(field, this.getMessage('password'));
      return false;
    }
    return true;
  }

  /**
   * Validate password confirmation
   */
  confirmPassword(password, confirmPassword, field) {
    if (password !== confirmPassword) {
      this.addError(field, this.getMessage('confirmPassword'));
      return false;
    }
    return true;
  }

  /**
   * Validate age
   */
  age(value, field) {
    if (!value) return true;
    
    const age = parseInt(value);
    if (isNaN(age) || age < 1 || age > 120) {
      this.addError(field, this.getMessage('age'));
      return false;
    }
    return true;
  }

  /**
   * Validate date
   */
  date(value, field, format = 'YYYY-MM-DD') {
    if (!value) return true;
    
    const date = moment.tz(value, format, this.timezone);
    if (!date.isValid()) {
      this.addError(field, this.getMessage('date'));
      return false;
    }
    return true;
  }

  /**
   * Validate amount (money)
   */
  amount(value, field, min = 0, max = 10000000) {
    if (!value) return true;
    
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < min || amount > max) {
      this.addError(field, this.getMessage('amount'));
      return false;
    }
    return true;
  }

  /**
   * Validate Nigerian state
   */
  nigerianState(value, field) {
    if (!value) return true;
    
    if (!NIGERIAN_STATES.includes(value)) {
      this.addError(field, 'Please select a valid Nigerian state');
      return false;
    }
    return true;
  }

  /**
   * Church-specific validations
   */

  /**
   * Validate member ID
   */
  memberID(value, field) {
    if (!value) return true;
    
    if (!PATTERNS.memberID.test(value)) {
      this.addError(field, this.getMessage('memberID'));
      return false;
    }
    return true;
  }

  /**
   * Validate Bible verse reference
   */
  bibleVerse(value, field) {
    if (!value) return true;
    
    if (!PATTERNS.bibleVerse.test(value)) {
      this.addError(field, this.getMessage('bibleVerse'));
      return false;
    }
    return true;
  }

  /**
   * Validate membership type
   */
  membershipType(value, field) {
    if (!value) return true;
    
    if (!CHURCH_RULES.membershipTypes.includes(value)) {
      this.addError(field, 'Please select a valid membership type');
      return false;
    }
    return true;
  }

  /**
   * Validate department
   */
  department(value, field) {
    if (!value) return true;
    
    if (!CHURCH_RULES.departments.includes(value)) {
      this.addError(field, 'Please select a valid department');
      return false;
    }
    return true;
  }

  /**
   * Validate donation type
   */
  donationType(value, field) {
    if (!value) return true;
    
    if (!CHURCH_RULES.donationTypes.includes(value)) {
      this.addError(field, 'Please select a valid donation type');
      return false;
    }
    return true;
  }

  /**
   * File validation methods
   */

  /**
   * Validate file upload
   */
  file(file, field, options = {}) {
    if (!file) return true;
    
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      required = false
    } = options;
    
    if (required && !file) {
      this.addError(field, this.getMessage('required'));
      return false;
    }
    
    if (file.size > maxSize) {
      this.addError(field, this.getMessage('fileSize'));
      return false;
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      this.addError(field, this.getMessage('fileType'));
      return false;
    }
    
    return true;
  }

  /**
   * Security validation methods
   */

  /**
   * Sanitize HTML input
   */
  sanitizeHtml(value) {
    return sanitizeHtml(value, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      allowedAttributes: {}
    });
  }

  /**
   * Validate and sanitize input against XSS
   */
  xssSafe(value, field) {
    if (!value) return true;
    
    const sanitized = this.sanitizeHtml(value);
    if (sanitized !== value) {
      this.addError(field, 'Invalid characters detected');
      return false;
    }
    return true;
  }

  /**
   * Validate against SQL injection patterns
   */
  sqlSafe(value, field) {
    if (!value) return true;
    
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\bOR\b|\bAND\b).*=.*\1/i
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        this.addError(field, 'Invalid characters detected');
        return false;
      }
    }
    return true;
  }

  /**
   * Composite validation methods for common forms
   */

  /**
   * Validate member registration form
   */
  validateMemberRegistration(data) {
    this.clearErrors();
    
    // Required fields
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.lastName, 'lastName') && this.name(data.lastName, 'lastName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.phone, 'phone') && this.phone(data.phone, 'phone');
    this.required(data.dateOfBirth, 'dateOfBirth') && this.date(data.dateOfBirth, 'dateOfBirth');
    this.required(data.gender, 'gender');
    this.required(data.address, 'address');
    this.required(data.state, 'state') && this.nigerianState(data.state, 'state');
    
    // Optional fields
    this.membershipType(data.membershipType, 'membershipType');
    this.department(data.department, 'department');
    
    // Security checks
    this.xssSafe(data.firstName, 'firstName');
    this.xssSafe(data.lastName, 'lastName');
    this.xssSafe(data.address, 'address');
    
    return this.isValid();
  }

  /**
   * Validate contact form
   */
  validateContactForm(data) {
    this.clearErrors();
    
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.lastName, 'lastName') && this.name(data.lastName, 'lastName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.subject, 'subject');
    this.required(data.message, 'message');
    
    this.phone(data.phone, 'phone'); // Optional
    
    // Security checks
    this.xssSafe(data.subject, 'subject');
    this.xssSafe(data.message, 'message');
    this.sqlSafe(data.subject, 'subject');
    this.sqlSafe(data.message, 'message');
    
    return this.isValid();
  }

  /**
   * Validate prayer request form
   */
  validatePrayerRequest(data) {
    this.clearErrors();
    
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.prayerRequest, 'prayerRequest');
    this.required(data.category, 'category');
    
    // Security checks
    this.xssSafe(data.prayerRequest, 'prayerRequest');
    this.sqlSafe(data.prayerRequest, 'prayerRequest');
    
    return this.isValid();
  }

  /**
   * Validate donation form
   */
  validateDonation(data) {
    this.clearErrors();
    
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.lastName, 'lastName') && this.name(data.lastName, 'lastName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.amount, 'amount') && this.amount(data.amount, 'amount', 100); // Min ₦100
    this.required(data.donationType, 'donationType') && this.donationType(data.donationType, 'donationType');
    
    this.phone(data.phone, 'phone'); // Optional
    
    return this.isValid();
  }

  /**
   * Validate event registration
   */
  validateEventRegistration(data) {
    this.clearErrors();
    
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.lastName, 'lastName') && this.name(data.lastName, 'lastName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.phone, 'phone') && this.phone(data.phone, 'phone');
    this.required(data.eventId, 'eventId');
    
    this.age(data.age, 'age'); // Optional
    
    return this.isValid();
  }

  /**
   * Validate user login
   */
  validateLogin(data) {
    this.clearErrors();
    
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.password, 'password');
    
    return this.isValid();
  }

  /**
   * Validate user registration
   */
  validateUserRegistration(data) {
    this.clearErrors();
    
    this.required(data.firstName, 'firstName') && this.name(data.firstName, 'firstName');
    this.required(data.lastName, 'lastName') && this.name(data.lastName, 'lastName');
    this.required(data.email, 'email') && this.email(data.email, 'email');
    this.required(data.password, 'password') && this.password(data.password, 'password');
    this.required(data.confirmPassword, 'confirmPassword') && 
      this.confirmPassword(data.password, data.confirmPassword, 'confirmPassword');
    
    this.phone(data.phone, 'phone'); // Optional
    
    return this.isValid();
  }

  /**
   * Utility methods
   */

  /**
   * Format Nigerian phone number
   */
  static formatNigerianPhone(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    } else if (cleaned.length === 10) {
      return '+234' + cleaned;
    }
    
    return phone; // Return as-is if can't format
  }

  /**
   * Generate member ID
   */
  static generateMemberID() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return 'HWC' + timestamp.slice(-3) + random;
  }

  /**
   * Check if email domain is Nigerian
   */
  static isNigerianEmail(email) {
    const nigerianDomains = ['.ng', 'yahoo.com', 'gmail.com', 'hotmail.com'];
    return nigerianDomains.some(domain => email.toLowerCase().includes(domain));
  }

  /**
   * Validate Nigerian bank account
   */
  validateBankAccount(accountNumber, bankCode, field) {
    if (!accountNumber) return true;
    
    if (!PATTERNS.bankAccount.test(accountNumber)) {
      this.addError(field, 'Please enter a valid 10-digit account number');
      return false;
    }
    
    // You can add bank code validation here
    // This would require integrating with Nigerian bank APIs
    
    return true;
  }
}

/**
 * Middleware for Express.js validation
 */
const validationMiddleware = (validationFunction) => {
  return (req, res, next) => {
    const validator = new ChurchValidator(req.headers['accept-language'] || 'en');
    
    const isValid = validator[validationFunction](req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validator.getErrors()
      });
    }
    
    // Attach validator to request for further use
    req.validator = validator;
    next();
  };
};

/**
 * Export validation functions
 */
module.exports = {
  ChurchValidator,
  validationMiddleware,
  PATTERNS,
  NIGERIAN_STATES,
  CHURCH_RULES,
  ERROR_MESSAGES
};