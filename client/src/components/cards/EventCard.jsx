import React from 'react';
import { formatDate, formatTime, truncateText } from '../../utils/helpers';
import { CHURCH_CONFIG } from '../../utils/constants';

/**
 * EventCard Component
 * 
 * Displays event information in a clean, accessible card format
 * Supports different event types and responsive design
 * 
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @param {string} props.event.id - Unique event identifier
 * @param {string} props.event.title - Event title
 * @param {string} props.event.description - Event description
 * @param {string} props.event.date - Event date (ISO string)
 * @param {string} props.event.time - Event time
 * @param {string} props.event.location - Event location
 * @param {string} props.event.type - Event type (service, conference, outreach, etc.)
 * @param {string} props.event.image - Event image URL
 * @param {string} props.event.status - Event status (upcoming, ongoing, completed)
 * @param {boolean} props.event.requiresRSVP - Whether RSVP is required
 * @param {number} props.event.attendeeCount - Current number of attendees
 * @param {number} props.event.maxAttendees - Maximum attendees allowed
 * @param {Function} props.onRSVP - RSVP button click handler
 * @param {Function} props.onViewDetails - View details click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {boolean} props.compact - Compact card view
 */
const EventCard = ({
  event,
  onRSVP,
  onViewDetails,
  className = '',
  showActions = true,
  compact = false
}) => {
  // Destructure event properties with defaults
  const {
    id,
    title = 'Untitled Event',
    description = '',
    date,
    time,
    location = 'Haven Word Church',
    type = 'general',
    image,
    status = 'upcoming',
    requiresRSVP = false,
    attendeeCount = 0,
    maxAttendees = null,
    speaker = null,
    tags = []
  } = event || {};

  // Event type styling
  const getEventTypeStyle = (eventType) => {
    const styles = {
      service: 'bg-blue-100 text-blue-800 border-blue-200',
      conference: 'bg-purple-100 text-purple-800 border-purple-200',
      outreach: 'bg-green-100 text-green-800 border-green-200',
      youth: 'bg-orange-100 text-orange-800 border-orange-200',
      prayer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[eventType] || styles.general;
  };

  // Status styling
  const getStatusStyle = (eventStatus) => {
    const styles = {
      upcoming: 'text-green-600',
      ongoing: 'text-blue-600',
      completed: 'text-gray-500',
      cancelled: 'text-red-600'
    };
    return styles[eventStatus] || styles.upcoming;
  };

  // Format date and time for display
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDate(dateString, { includeYear: true, format: 'medium' });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return dateString;
    }
  };

  const formatEventTime = (timeString) => {
    if (!timeString) return '';
    try {
      return formatTime(timeString);
    } catch (error) {
      console.warn('Invalid time format:', timeString);
      return timeString;
    }
  };

  // Check if event is full
  const isEventFull = maxAttendees && attendeeCount >= maxAttendees;

  // Handle RSVP click
  const handleRSVP = (e) => {
    e.stopPropagation();
    if (onRSVP && typeof onRSVP === 'function') {
      onRSVP(event);
    }
  };

  // Handle view details click
  const handleViewDetails = () => {
    if (onViewDetails && typeof onViewDetails === 'function') {
      onViewDetails(event);
    }
  };

  // Render compact version
  if (compact) {
    return (
      <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
        onClick={handleViewDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleViewDetails();
          }
        }}
        aria-label={`Event: ${title}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {formatEventDate(date)} {time && `• ${formatEventTime(time)}`}
            </p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeStyle(type)}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
      </div>
    );
  }

  // Render full card
  return (
    <article 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
      role="article"
      aria-labelledby={`event-title-${id}`}
    >
      {/* Event Image */}
      {image && (
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={image}
            alt={`${title} event image`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)} bg-white bg-opacity-90`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          {/* Event Type Badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeStyle(type)} bg-opacity-90`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 
            id={`event-title-${id}`}
            className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
          >
            {title}
          </h3>
          
          {/* Event Details */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* Date and Time */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatEventDate(date)}
                {time && ` at ${formatEventTime(time)}`}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>

            {/* Speaker */}
            {speaker && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Speaker: {speaker}</span>
              </div>
            )}

            {/* Attendance Info */}
            {(attendeeCount > 0 || maxAttendees) && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>
                  {attendeeCount} attending
                  {maxAttendees && ` of ${maxAttendees}`}
                  {isEventFull && <span className="text-red-600 font-medium"> (Full)</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 mb-4 line-clamp-3">
            {truncateText(description, 150)}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label={`View details for ${title}`}
            >
              View Details
            </button>
            
            {requiresRSVP && status === 'upcoming' && (
              <button
                onClick={handleRSVP}
                disabled={isEventFull}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                  isEventFull
                    ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
                aria-label={isEventFull ? 'Event is full' : `RSVP for ${title}`}
              >
                {isEventFull ? 'Event Full' : 'RSVP'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default EventCard;