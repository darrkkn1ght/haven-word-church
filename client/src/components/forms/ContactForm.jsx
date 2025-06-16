import React, { useState, useRef } from 'react';
import { validateEmail, validatePhone, validateRequired, validateLength } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';
import { sendContactMessage } from '../../services/api';

/**
 * ContactForm Component - Comprehensive contact form for Haven Word Church
 * 
 * Features:
 * - Real-time validation with Nigerian context
 * - Multiple contact reasons/categories
 * - File attachment support
 * - Accessibility compliant
 * - Success/error handling
 * - reCAPTCHA integration ready
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback for successful submission
 * @param {Function} props.onError - Callback for submission error
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showTitle - Whether to show form title
 * @param {Object} props.defaultValues - Default form values
 */
const ContactForm = ({
  onSuccess,
  onError,
  className = '',
  showTitle = true,
  defaultValues = {}
}) => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: defaultValues.firstName || '',
    lastName: defaultValues.lastName || '',
    email: defaultValues.email || '',
    phone: defaultValues.phone || '',
    subject: defaultValues.subject || '',
    category: defaultValues.category || 'general',
    message: defaultValues.message || '',
    preferredContact: defaultValues.preferredContact || 'email',
    urgent: defaultValues.urgent || false,
    newsletter: defaultValues.newsletter || false
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // File upload state
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Contact categories
  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'prayer', label: 'Prayer Request' },
    { value: 'pastoral', label: 'Pastoral Care' },
    { value: 'ministry', label: 'Ministry Information' },
    { value: 'events', label: 'Events & Programs' },
    { value: 'membership', label: 'Church Membership' },
    { value: 'volunteering', label: 'Volunteering' },
    { value: 'donations', label: 'Donations & Giving' },
    { value: 'technical', label: 'Website/Technical Issue' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  /**
   * Validate individual field
   */
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        error = validateRequired(value, `${name === 'firstName' ? 'First' : 'Last'} name is required`);
        if (!error) {
          error = validateLength(value, 2, 50, `${name === 'firstName' ? 'First' : 'Last'} name must be between 2-50 characters`);
        }
        break;

      case 'email':
        error = validateRequired(value, 'Email address is required');
        if (!error) {
          error = validateEmail(value);
        }
        break;

      case 'phone':
        if (value.trim()) {
          error = validatePhone(value);
        }
        break;

      case 'subject':
        error = validateRequired(value, 'Subject is required');
        if (!error) {
          error = validateLength(value, 5, 100, 'Subject must be between 5-100 characters');
        }
        break;

      case 'message':
        error = validateRequired(value, 'Message is required');
        if (!error) {
          error = validateLength(value, 20, 2000, 'Message must be between 20-2000 characters');
        }
        break;

      default:
        break;
    }

    return error;
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate phone if provided
    if (formData.phone.trim()) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle field blur for validation
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  /**
   * Handle file attachment
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setSubmitError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setSubmitError(`File "${file.name}" type is not supported.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
    setSubmitError('');
  };

  /**
   * Remove attachment
   */
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare form data for submission
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add attachments
      attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      // Add timestamp and source
      submitData.append('timestamp', new Date().toISOString());
      submitData.append('source', 'website_contact_form');
      submitData.append('user_agent', navigator.userAgent);

      // Submit form
      await sendContactMessage(submitData);

      // Success handling
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(formData);
      }

      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          category: 'general',
          message: '',
          preferredContact: 'email',
          urgent: false,
          newsletter: false
        });
        setAttachments([]);
        setIsSubmitted(false);
        setTouched({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message. Please try again.';
      setSubmitError(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message display
  if (isSubmitted) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for contacting Haven Word Church. We'll get back to you within 24 hours.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For urgent matters, please call us at <a href="tel:+2348031234567" className="text-blue-600 hover:underline">+234-803-123-4567</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Get in Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
              disabled={isSubmitting}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
              disabled={isSubmitting}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+234-803-123-4567"
              disabled={isSubmitting}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Subject and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="What's this about?"
              disabled={isSubmitting}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
            />
            {errors.subject && (
              <p id="subject-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSubmitting}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Please share your message with us..."
            disabled={isSubmitting}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message && (
              <p id="message-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.message}
              </p>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {formData.message.length}/2000
            </span>
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attachments <span className="text-gray-500">(Optional - Max 3 files, 5MB each)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,.txt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSubmitting || attachments.length >= 3}
          />
          
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="preferredContact"
                  value="email"
                  checked={formData.preferredContact === 'email'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="preferredContact"
                  value="phone"
                  checked={formData.preferredContact === 'phone'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Phone</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="preferredContact"
                  value="whatsapp"
                  checked={formData.preferredContact === 'whatsapp'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="urgent"
                checked={formData.urgent}
                onChange={handleChange}
                className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">This is urgent</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Subscribe to our newsletter</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending Message...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>

        {/* Contact Info */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Or reach us directly:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+2348031234567" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +234-803-123-4567
              </a>
              <a href="mailto:hello@havenwordchurch.ng" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hello@havenwordchurch.ng
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;