import React from 'react';
import { formatDate } from '../../utils/helpers';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

/**
 * MinistryCard Component
 * 
 * Displays ministry information including name, description, leadership,
 * meeting details, and contact information. Designed for Nigerian church context.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.ministry - Ministry object
 * @param {string} props.ministry.id - Unique ministry identifier
 * @param {string} props.ministry.name - Ministry name
 * @param {string} props.ministry.description - Ministry description
 * @param {string} props.ministry.image - Ministry featured image URL
 * @param {Object} props.ministry.leader - Ministry leader information
 * @param {string} props.ministry.leader.name - Leader name
 * @param {string} props.ministry.leader.title - Leader title/position
 * @param {string} props.ministry.leader.image - Leader profile image
 * @param {string} props.ministry.leader.phone - Leader phone number
 * @param {string} props.ministry.leader.email - Leader email
 * @param {Object} props.ministry.schedule - Meeting schedule
 * @param {string} props.ministry.schedule.day - Meeting day
 * @param {string} props.ministry.schedule.time - Meeting time
 * @param {string} props.ministry.schedule.location - Meeting location
 * @param {string} props.ministry.schedule.frequency - Meeting frequency
 * @param {string} props.ministry.category - Ministry category
 * @param {number} props.ministry.memberCount - Number of active members
 * @param {string[]} props.ministry.activities - List of ministry activities
 * @param {string} props.ministry.ageGroup - Target age group
 * @param {boolean} props.ministry.isActive - Whether ministry is currently active
 * @param {string} props.ministry.established - Ministry establishment date
 * @param {string} [props.variant='default'] - Card variant style
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onJoin] - Join ministry handler
 * @param {Function} [props.onContact] - Contact ministry handler
 * @param {Function} [props.onClick] - Card click handler
 * @param {boolean} [props.showSchedule=true] - Whether to show schedule info
 * @param {boolean} [props.showLeader=true] - Whether to show leader info
 * @param {boolean} [props.showMemberCount=true] - Whether to show member count
 * @param {boolean} [props.showActivities=true] - Whether to show activities
 * @param {boolean} [props.showJoinButton=true] - Whether to show join button
 * @returns {JSX.Element} MinistryCard component
 * 
 * @example
 * const ministry = {
 *   id: '1',
 *   name: 'Youth Ministry',
 *   description: 'Building young leaders for tomorrow',
 *   leader: {
 *     name: 'Pastor David Okafor',
 *     title: 'Youth Pastor',
 *     phone: '+234 802 123 4567'
 *   },
 *   schedule: {
 *     day: 'Saturday',
 *     time: '10:00 AM',
 *     location: 'Youth Hall'
 *   },
 *   category: 'Youth',
 *   memberCount: 45,
 *   ageGroup: '13-35 years'
 * };
 * 
 * <MinistryCard 
 *   ministry={ministry}
 *   onJoin={() => handleJoinMinistry(ministry.id)}
 * />
 */
const MinistryCard = ({
  ministry,
  variant = 'default',
  className = '',
  onJoin,
  onContact,
  onClick,
  showSchedule = true,
  showLeader = true,
  showMemberCount = true,
  showActivities = true,
  showJoinButton = true
}) => {
  // Destructure ministry properties with defaults
  const {
    title,
    name,
    description = '',
    image,
    leader = {},
    schedule = {},
    category = 'General',
    memberCount = 0,
    activities = [],
    ageGroup = 'All Ages',
    isActive = true,
    established
  } = ministry || {};
  // Prefer title, then name, then fallback
  const displayName = title && title.trim() ? title : (name && name.trim() ? name : 'Unnamed Ministry');

  // Determine card classes based on variant
  const getCardClasses = () => {
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300';
    
    const variantClasses = {
      default: 'hover:shadow-md hover:border-primary-200',
      compact: 'hover:shadow-md',
      featured: 'ring-2 ring-primary-100 hover:ring-primary-200',
      minimal: 'shadow-none border-0 hover:shadow-sm'
    };

    const statusClasses = isActive ? '' : 'opacity-75';

    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${statusClasses} ${className}`;
  };

  // Get category color classes
  const getCategoryColor = (category) => {
    const colors = {
      'Youth': 'bg-orange-100 text-orange-800',
      'Children': 'bg-pink-100 text-pink-800',
      'Women': 'bg-purple-100 text-purple-800',
      'Men': 'bg-blue-100 text-blue-800',
      'Music': 'bg-green-100 text-green-800',
      'Prayer': 'bg-indigo-100 text-indigo-800',
      'Outreach': 'bg-red-100 text-red-800',
      'Bible Study': 'bg-yellow-100 text-yellow-800',
      'Media': 'bg-teal-100 text-teal-800',
      'Hospitality': 'bg-rose-100 text-rose-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  // Format schedule display
  const formatSchedule = () => {
    const { day, time, frequency = 'Weekly' } = schedule;
    if (!day && !time) return null;
    
    const parts = [];
    if (frequency && frequency !== 'Weekly') parts.push(frequency);
    if (day) parts.push(day);
    if (time) parts.push(`at ${time}`);
    
    return parts.join(' ');
  };

  // Handle join ministry
  const handleJoin = (e) => {
    e.stopPropagation();
    if (onJoin && typeof onJoin === 'function') {
      onJoin(ministry);
    }
  };

  // Handle contact leader
  const handleContact = (e) => {
    e.stopPropagation();
    if (onContact && typeof onContact === 'function') {
      onContact(leader);
    }
  };

  // Handle card click
  const handleCardClick = (e) => {
    if (onClick && typeof onClick === 'function') {
      onClick(e, ministry);
    }
  };

  return (
    <div
      className={getCardClasses()}
      onClick={handleCardClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      aria-label={`${displayName || 'Ministry'} ministry information`}
    >
      {/* Header with Image */}
      {image && (
        <div className="relative h-40 bg-gray-200 overflow-hidden">
          <img
            src={image}
            alt={`${name} ministry`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback for broken images */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 items-center justify-center hidden">
            <svg
              className="w-16 h-16 text-white opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName || 'Ministry'}
              </h3>
              {!isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                {category}
              </span>
              {ageGroup && (
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  {ageGroup}
                </span>
              )}
            </div>
          </div>

          {showMemberCount && memberCount > 0 && (
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-600">
                {memberCount}
              </div>
              <div className="text-xs text-gray-500">
                {memberCount === 1 ? 'Member' : 'Members'}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Activities */}
        {showActivities && activities && activities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Activities:</h4>
            <div className="flex flex-wrap gap-1">
              {activities.slice(0, 3).map((activity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                >
                  {activity}
                </span>
              ))}
              {activities.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-0.5">
                  +{activities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Schedule */}
        {showSchedule && schedule && Object.keys(schedule).length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center mb-2">
              <svg
                className="w-4 h-4 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule</span>
            </div>
            
            {formatSchedule() && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {formatSchedule()}
              </p>
            )}
            
            {schedule.location && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {schedule.location}
              </div>
            )}
          </div>
        )}

        {/* Leader Info */}
        {showLeader && leader && leader.name && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {leader.image ? (
                  <img
                    src={leader.image}
                    alt={`${leader.name} profile`}
                    className="w-10 h-10 rounded-full mr-3"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary-600">
                      {leader.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {leader.name}
                  </p>
                  {leader.title && (
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {leader.title}
                    </p>
                  )}
                </div>
              </div>
              
              {(leader.phone || leader.email) && (
                <Button
                  onClick={handleContact}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary-600 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
                  aria-label={`Contact ${leader.name}`}
                >
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isActive && showJoinButton && (
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              onClick={handleJoin}
              variant="primary"
              size="sm"
              className="flex-1"
              aria-label={`Join ${displayName || 'Ministry'} ministry`}
            >
              Join Ministry
            </Button>
            
            {onClick && (
              <Button
                onClick={handleCardClick}
                variant="outline"
                size="sm"
                aria-label={`Learn more about ${displayName || 'Ministry'}`}
              >
                Learn More
              </Button>
            )}
          </div>
        )}

        {/* Established Date */}
        {established && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Established {formatDate(established)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

MinistryCard.propTypes = {
  ministry: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    leader: PropTypes.shape({
      name: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string
    }),
    schedule: PropTypes.shape({
      day: PropTypes.string,
      time: PropTypes.string,
      location: PropTypes.string,
      frequency: PropTypes.string
    }),
    category: PropTypes.string,
    memberCount: PropTypes.number,
    activities: PropTypes.arrayOf(PropTypes.string),
    ageGroup: PropTypes.string,
    isActive: PropTypes.bool,
    established: PropTypes.string
  }),
  variant: PropTypes.string,
  className: PropTypes.string,
  onJoin: PropTypes.func,
  onContact: PropTypes.func,
  onClick: PropTypes.func,
  showSchedule: PropTypes.bool,
  showLeader: PropTypes.bool,
  showMemberCount: PropTypes.bool,
  showActivities: PropTypes.bool,
  showJoinButton: PropTypes.bool
};

export default MinistryCard;