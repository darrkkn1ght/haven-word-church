import React, { useState, useEffect } from 'react';
import { validateEmail, validatePhone, validateRequired, validateLength } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';
import { submitRSVP, getEventDetails } from '../../services/api';

/**
 * RSVPForm Component - Event RSVP form for Haven Word Church
 * 
 * Features:
 * - Dynamic event information display
 * - Guest management (multiple attendees)
 * - Dietary restrictions and accessibility needs
 * - Transportation coordination
 * - Volunteer opportunities
 * - Nigerian context integration
 * - Real-time validation
 * 
 * @param {Object} props - Component props
 * @param {string} props.eventId - Event ID for RSVP
 * @param {Object} props.eventData - Pre-loaded event data (optional)
 * @param {Function} props.onSuccess - Callback for successful RSVP
 * @param {Function} props.onError - Callback for RSVP error
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.allowGuests - Whether to allow guest registration
 * @param {number} props.maxGuests - Maximum number of guests allowed
 */
const RSVPForm = ({
  eventId,
  eventData = null,
  onSuccess,
  onError,
  className = '',
  allowGuests = true,
  maxGuests = 5
}) => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    attendance: 'yes',
    guestCount: 0,
    guests: [],
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    transportation: 'own',
    pickupLocation: '',
    volunteer: false,
    volunteerAreas: [],
    comments: '',
    emergencyContact: '',
    emergencyPhone: '',
    newsletter: false
  });

  // Event and form state
  const [event, setEvent] = useState(eventData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(!eventData && !!eventId);
  const [submitError, setSubmitError] = useState('');

  // Transportation options
  const transportationOptions = [
    { value: 'own', label: 'Own Transportation' },
    { value: 'church_bus', label: 'Church Bus Service' },
    { value: 'carpool', label: 'Carpool with Others' },
    { value: 'public', label: 'Public Transportation' },
    { value: 'taxi', label: 'Taxi/Ride Service' }
  ];

  // Volunteer areas
  const volunteerAreas = [
    { value: 'setup', label: 'Event Setup' },
    { value: 'registration', label: 'Registration/Check-in' },
    { value: 'ushering', label: 'Ushering' },
    { value: 'childcare', label: 'Childcare Assistance' },
    { value: 'tech', label: 'Audio/Visual Support' },
    { value: 'hospitality', label: 'Hospitality/Refreshments' },
    { value: 'cleanup', label: 'Event Cleanup' },
    { value: 'photography', label: 'Photography/Documentation' },
    { value: 'security', label: 'Security/Parking' },
    { value: 'other', label: 'Other (specify in comments)' }
  ];

  // Pickup locations for church bus
  const pickupLocations = [
    'Church Main Building',
    'UI Gate (University of Ibadan)',
    'Dugbe Market Area',
    'Ring Road Junction',
    'Bodija Market',
    'Mokola Roundabout',
    'Sango Area',
    'Apata Area'
  ];

  /**
   * Load event details if not provided
   */
  useEffect(() => {
    const loadEventDetails = async () => {
      if (!eventId || event) return;

      try {
        setIsLoading(true);
        const eventDetails = await getEventDetails(eventId);
        setEvent(eventDetails);
      } catch (error) {
        setSubmitError('Failed to load event details. Please refresh the page.');
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEventDetails();
  }, [eventId, event, onError]);

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
        error = validateRequired(value, 'Phone number is required');
        if (!error) {
          error = validatePhone(value);
        }
        break;

      case 'emergencyContact':
        if (formData.guestCount > 0 || (event?.requiresEmergencyContact)) {
          error = validateRequired(value, 'Emergency contact is required');
          if (!error) {
            error = validateLength(value, 2, 100, 'Emergency contact name must be between 2-100 characters');
          }
        }
        break;

      case 'emergencyPhone':
        if (formData.guestCount > 0 || (event?.requiresEmergencyContact)) {
          error = validateRequired(value, 'Emergency contact phone is required');
          if (!error) {
            error = validatePhone(value);
          }
        }
        break;

      case 'pickupLocation':
        if (formData.transportation === 'church_bus') {
          error = validateRequired(value, 'Pickup location is required for church bus service');
        }
        break;

      default:
        break;
    }

    return error;
  };

  /**
   * Validate guest information
   */
  const validateGuests = () => {
    const guestErrors = {};
    
    formData.guests.forEach((guest, index) => {
      if (!guest.name.trim()) {
        guestErrors[`guest_${index}_name`] = 'Guest name is required';
      } else if (guest.name.length < 2 || guest.name.length > 50) {
        guestErrors[`guest_${index}_name`] = 'Guest name must be between 2-50 characters';
      }

      if (guest.age && (guest.age < 0 || guest.age > 120)) {
        guestErrors[`guest_${index}_age`] = 'Please enter a valid age';
      }
    });

    return guestErrors;
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];

    // Validate required fields
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate conditional fields
    ['emergencyContact', 'emergencyPhone', 'pickupLocation'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate guests
    const guestErrors = validateGuests();
    Object.assign(newErrors, guestErrors);

    // Check event capacity if available
    if (event?.capacity && event?.currentAttendees) {
      const totalAttendees = 1 + formData.guestCount;
      const remainingSpots = event.capacity - event.currentAttendees;
      
      if (totalAttendees > remainingSpots) {
        newErrors.guestCount = `Only ${remainingSpots} spots remaining for this event`;
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
    let fieldValue = type === 'checkbox' ? checked : value;

    // Special handling for guest count
    if (name === 'guestCount') {
      const count = parseInt(value) || 0;
      fieldValue = Math.max(0, Math.min(count, maxGuests));
      
      // Adjust guests array
      const currentGuests = [...formData.guests];
      if (count > currentGuests.length) {
        // Add new guest objects
        for (let i = currentGuests.length; i < count; i++) {
          currentGuests.push({ name: '', age: '', dietary: '' });
        }
      } else {
        // Remove excess guests
        currentGuests.splice(count);
      }
      
      setFormData(prev => ({
        ...prev,
        guestCount: fieldValue,
        guests: currentGuests
      }));
      return;
    }

    // Special handling for volunteer areas
    if (name === 'volunteerAreas') {
      const areas = formData.volunteerAreas.includes(value)
        ? formData.volunteerAreas.filter(area => area !== value)
        : [...formData.volunteerAreas, value];
      
      setFormData(prev => ({
        ...prev,
        volunteerAreas: areas
      }));
      return;
    }

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
   * Handle guest information change
   */
  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...formData.guests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      guests: updatedGuests
    }));

    // Clear guest-specific errors
    const errorKey = `guest_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
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
      // Prepare RSVP data
      const rsvpData = {
        ...formData,
        eventId: eventId || event?.id,
        timestamp: new Date().toISOString(),
        source: 'website_rsvp_form',
        totalAttendees: 1 + formData.guestCount
      };

      // Submit RSVP
      await submitRSVP(rsvpData);

      // Success handling
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(rsvpData);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit RSVP. Please try again.';
      setSubmitError(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading event details...</span>
        </div>
      </div>
    );
  }

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
            RSVP Confirmed!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for registering for {event?.title}. We're excited to see you there!
          </p>
          {formData.attendance === 'yes' && (
            <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Event Details:</strong><br />
                📅 {event?.date} at {event?.time}<br />
                📍 {event?.location}<br />
                👥 Total Attendees: {1 + formData.guestCount}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You should receive a confirmation email shortly. For questions, call us at{' '}
            <a href="tel:+2348031234567" className="text-blue-600 hover:underline">+234-803-123-4567</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 ${className}`}>
      {/* Event Information */}
      {event && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date} at {event.time}
            </div>
            <div className="flex items-center">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
            {event.capacity && (
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {event.currentAttendees || 0} / {event.capacity} registered
              </div>
            )}
            {event.cost && (
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {event.cost === 0 ? 'Free Event' : `₦${event.cost.toLocaleString()}`}
              </div>
            )}
          </div>
          {event.description && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {event.description}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Attendance Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Will you be attending this event? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="attendance"
                value="yes"
                checked={formData.attendance === 'yes'}
                onChange={handleChange}
                className="mr-3 text-green-600 focus:ring-green-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Yes, I'll be there! 🎉
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attendance"
                value="no"
                checked={formData.attendance === 'no'}
                onChange={handleChange}
                className="mr-3 text-red-600 focus:ring-red-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                No, I can't make it 😔
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attendance"
                value="maybe"
                checked={formData.attendance === 'maybe'}
                onChange={handleChange}
                className="mr-3 text-yellow-600 focus:ring-yellow-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Maybe, I'm not sure yet 🤔
              </span>
            </label>
          </div>
        </div>

        {/* Personal Information */}
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
              Phone Number *
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

        {/* Show additional fields only if attending */}
        {formData.attendance === 'yes' && (
          <>
            {/* Guest Information */}
            {allowGuests && (
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Guests (Max {maxGuests})
                </label>
                <input
                  type="number"
                  id="guestCount"
                  name="guestCount"
                  min="0"
                  max={maxGuests}
                  value={formData.guestCount}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.guestCount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  aria-describedby={errors.guestCount ? 'guestCount-error' : undefined}
                />
                {errors.guestCount && (
                  <p id="guestCount-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.guestCount}
                  </p>
                )}

                {/* Guest Details */}
                {formData.guestCount > 0 && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Guest Information</h4>
                    {formData.guests.map((guest, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Guest {index + 1}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                                errors[`guest_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Guest name"
                              disabled={isSubmitting}
                            />
                            {errors[`guest_${index}_name`] && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors[`guest_${index}_name`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Age (Optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              value={guest.age}
                              onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="Age"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Dietary Restrictions
                            </label>
                            <input
                              type="text"
                              value={guest.dietary}
                              onChange={(e) => handleGuestChange(index, 'dietary', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="Any dietary needs"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dietary Restrictions and Accessibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dietary Restrictions
                </label>
                <textarea
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  rows="3"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Any dietary restrictions or food allergies..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="accessibilityNeeds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Accessibility Needs
                </label>
                <textarea
                  id="accessibilityNeeds"
                  name="accessibilityNeeds"
                  rows="3"
                  value={formData.accessibilityNeeds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Wheelchair access, sign language, etc..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Transportation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Transportation
              </label>
              <div className="space-y-2">
                {transportationOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="transportation"
                      value={option.value}
                      checked={formData.transportation === option.value}
                      onChange={handleChange}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Church Bus Pickup Location */}
              {formData.transportation === 'church_bus' && (
                <div className="mt-4">
                  <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Location *
                  </label>
                  <select
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                    aria-describedby={errors.pickupLocation ? 'pickupLocation-error' : undefined}
                  >
                    <option value="">Select pickup location</option>
                    {pickupLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {errors.pickupLocation && (
                    <p id="pickupLocation-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.pickupLocation}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Church bus service is free. Departure time will be communicated via SMS.
                  </p>
                </div>
              )}
            </div>

            {/* Emergency Contact (for events with guests or special requirements) */}
            {(formData.guestCount > 0 || event?.requiresEmergencyContact) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Full name of emergency contact"
                    disabled={isSubmitting}
                    aria-describedby={errors.emergencyContact ? 'emergencyContact-error' : undefined}
                  />
                  {errors.emergencyContact && (
                    <p id="emergencyContact-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.emergencyContact}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+234-xxx-xxx-xxxx"
                    disabled={isSubmitting}
                    aria-describedby={errors.emergencyPhone ? 'emergencyPhone-error' : undefined}
                  />
                  {errors.emergencyPhone && (
                    <p id="emergencyPhone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Volunteer Opportunities */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="volunteer"
                  name="volunteer"
                  checked={formData.volunteer}
                  onChange={handleChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="volunteer" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  I'd like to volunteer to help with this event 🙋‍♀️
                </label>
              </div>

              {formData.volunteer && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Which areas would you like to help with?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {volunteerAreas.map((area) => (
                      <label key={area.value} className="flex items-start">
                        <input
                          type="checkbox"
                          name="volunteerAreas"
                          value={area.value}
                          checked={formData.volunteerAreas.includes(area.value)}
                          onChange={handleChange}
                          className="mr-2 mt-0.5 text-blue-600 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {area.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Comments or Questions
              </label>
              <textarea
                id="comments"
                name="comments"
                rows="4"
                value={formData.comments}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Anything else you'd like us to know? Questions about the event? Special requests?"
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
              className="mr-3 mt-0.5 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <div>
              <label htmlFor="newsletter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Keep me updated about church events and news
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll send you occasional updates about upcoming events, ministry opportunities, and church news. 
                You can unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {formData.attendance === 'yes' ? 'Confirming RSVP...' : 'Submitting Response...'}
              </>
            ) : (
              <>
                {formData.attendance === 'yes' ? '✅ Confirm My RSVP' : '📝 Submit Response'}
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                attendance: 'yes',
                guestCount: 0,
                guests: [],
                dietaryRestrictions: '',
                accessibilityNeeds: '',
                transportation: 'own',
                pickupLocation: '',
                volunteer: false,
                volunteerAreas: [],
                comments: '',
                emergencyContact: '',
                emergencyPhone: '',
                newsletter: false
              });
              setErrors({});
              setTouched({});
              setSubmitError('');
            }}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
          >
            Reset Form
          </button>
        </div>

        {/* Form Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p>
            By submitting this form, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            <br />
            For questions or assistance, call us at{' '}
            <a href="tel:+2348031234567" className="text-blue-600 hover:underline">+234-803-123-4567</a>{' '}
            or email{' '}
            <a href="mailto:events@havenwordchurch.org" className="text-blue-600 hover:underline">
              events@havenwordchurch.org
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RSVPForm;