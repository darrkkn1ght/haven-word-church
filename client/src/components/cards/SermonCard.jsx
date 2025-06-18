import React, { useState } from 'react';
import { formatDate, formatDuration, truncateText } from '../../utils/helpers';
import { CHURCH_CONFIG } from '../../utils/constants';

/**
 * SermonCard Component
 * 
 * Displays sermon information with media controls and engagement features
 * Supports audio/video playback, download, and sharing functionality
 * 
 * @param {Object} props - Component props
 * @param {Object} props.sermon - Sermon data object
 * @param {string} props.sermon.id - Unique sermon identifier
 * @param {string} props.sermon.title - Sermon title
 * @param {string} props.sermon.description - Sermon description/summary
 * @param {string} props.sermon.date - Sermon date (ISO string)
 * @param {string} props.sermon.speaker - Preacher/speaker name
 * @param {string} props.sermon.series - Sermon series name
 * @param {string} props.sermon.scripture - Bible verse/passage reference
 * @param {string} props.sermon.thumbnail - Sermon thumbnail image URL
 * @param {Object} props.sermon.media - Media files object
 * @param {string} props.sermon.media.audio - Audio file URL
 * @param {string} props.sermon.media.video - Video file URL
 * @param {string} props.sermon.media.notes - Sermon notes PDF URL
 * @param {number} props.sermon.duration - Duration in seconds
 * @param {string} props.sermon.category - Sermon category (sunday, midweek, special, etc.)
 * @param {Array} props.sermon.tags - Sermon tags/topics
 * @param {number} props.sermon.views - View count
 * @param {number} props.sermon.downloads - Download count
 * @param {boolean} props.sermon.featured - Whether sermon is featured
 * @param {Function} props.onPlay - Play button click handler
 * @param {Function} props.onDownload - Download button click handler
 * @param {Function} props.onShare - Share button click handler
 * @param {Function} props.onViewDetails - View details click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {boolean} props.compact - Compact card view
 * @param {boolean} props.isPlaying - Whether sermon is currently playing
 */
const SermonCard = ({
  sermon,
  onPlay,
  onDownload,
  onShare,
  onViewDetails,
  className = '',
  showActions = true,
  compact = false,
  isPlaying = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Destructure sermon properties with defaults
  const {
    id,
    title = 'Untitled Sermon',
    description = '',
    date,
    speaker = 'Haven Word Church',
    series = null,
    scripture = '',
    thumbnail,
    media = {},
    duration = 0,
    category = 'sunday',
    tags = [],
    views = 0,
    downloads = 0,
    featured = false
  } = sermon || {};

  // Category styling
  const getCategoryStyle = (sermonCategory) => {
    const styles = {
      sunday: 'bg-blue-100 text-blue-800 border-blue-200',
      midweek: 'bg-green-100 text-green-800 border-green-200',
      special: 'bg-purple-100 text-purple-800 border-purple-200',
      conference: 'bg-orange-100 text-orange-800 border-orange-200',
      revival: 'bg-red-100 text-red-800 border-red-200',
      teaching: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      youth: 'bg-pink-100 text-pink-800 border-pink-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[sermonCategory] || styles.general;
  };

  // Format sermon date
  const formatSermonDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Use a valid format string from DATE_FORMATS
      return formatDate(dateString, 'MMM dd, yyyy');
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return dateString;
    }
  };

  // Format duration
  const formatSermonDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '';
    try {
      return formatDuration(seconds);
    } catch (error) {
      return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  };

  // Handle play/pause
  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay && typeof onPlay === 'function') {
      onPlay(sermon);
    }
  };

  // Handle download
  const handleDownload = (e, mediaType = 'audio') => {
    e.stopPropagation();
    if (onDownload && typeof onDownload === 'function') {
      onDownload(sermon, mediaType);
    }
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare && typeof onShare === 'function') {
      onShare(sermon);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onViewDetails && typeof onViewDetails === 'function') {
      onViewDetails(sermon);
    }
  };

  // Check if media is available
  const hasAudio = media.audio && media.audio.trim() !== '';
  const hasVideo = media.video && media.video.trim() !== '';
  const hasNotes = media.notes && media.notes.trim() !== '';

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
        aria-label={`Sermon: ${title} by ${speaker}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {speaker} • {formatSermonDate(date)}
              {duration > 0 && ` • ${formatSermonDuration(duration)}`}
            </p>
          </div>
          
          {(hasAudio || hasVideo) && (
            <button
              onClick={handlePlay}
              className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
              aria-label={isPlaying ? 'Pause sermon' : 'Play sermon'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render full card
  return (
    <article 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
      role="article"
      aria-labelledby={`sermon-title-${id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {thumbnail && !imageError ? (
          <img
            src={thumbnail}
            alt={`${title} sermon thumbnail`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          // Default thumbnail with Bible icon
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <svg className="w-16 h-16 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 2L14 6.5V17.5L19 13V2M6.5 5C4.55 5 2.45 5.4 1 6.5V21.16C1 21.41 1.25 21.66 1.5 21.66C1.6 21.66 1.65 21.59 1.75 21.59C3.1 20.94 5.05 20.68 6.5 20.68C8.45 20.68 10.55 21.1 12 22C13.35 21.15 15.8 20.68 17.5 20.68C19.15 20.68 20.85 21.1 22.25 21.81C22.35 21.86 22.4 21.86 22.5 21.86C22.75 21.86 23 21.61 23 21.36V7.5C22.4 6.85 21.75 6.24 21 5.81V2L6.5 5Z"/>
            </svg>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              Featured
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryStyle(category)}`}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Duration Badge */}
        {duration > 0 && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-70 text-white">
              {formatSermonDuration(duration)}
            </span>
          </div>
        )}

        {/* Play Button Overlay */}
        {(hasAudio || hasVideo) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group"
              aria-label={isPlaying ? 'Pause sermon' : 'Play sermon'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Telegram Badge */}
        {series === 'telegram' && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 shadow">
              Telegram
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 
            id={`sermon-title-${id}`}
            className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
          >
            {title}
          </h3>
          
          {/* Sermon Details */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* Speaker and Date */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{speaker}</span>
              <span className="mx-2">•</span>
              <span>{formatSermonDate(date)}</span>
            </div>

            {/* Series */}
            {series && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Series: {series}</span>
              </div>
            )}

            {/* Scripture */}
            {scripture && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2L14 6.5V17.5L19 13V2M6.5 5C4.55 5 2.45 5.4 1 6.5V21.16C1 21.41 1.25 21.66 1.5 21.66C1.6 21.66 1.65 21.59 1.75 21.59C3.1 20.94 5.05 20.68 6.5 20.68C8.45 20.68 10.55 21.1 12 22C13.35 21.15 15.8 20.68 17.5 20.68C19.15 20.68 20.85 21.1 22.25 21.81C22.35 21.86 22.4 21.86 22.5 21.86C22.75 21.86 23 21.61 23 21.36V7.5C22.4 6.85 21.75 6.24 21 5.81V2L6.5 5Z"/>
                </svg>
                <span className="font-medium text-blue-700">{scripture}</span>
              </div>
            )}

            {/* Views and Downloads */}
            {(views > 0 || downloads > 0) && (
              <div className="flex items-center space-x-4">
                {views > 0 && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{views.toLocaleString()} views</span>
                  </div>
                )}
                {downloads > 0 && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{downloads.toLocaleString()} downloads</span>
                  </div>
                )}
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
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
            {/* Play/View Button */}
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label={`View details for ${title}`}
            >
              View Details
            </button>

            {/* Download Options */}
            {(hasAudio || hasVideo || hasNotes) && (
              <div className="flex gap-2">
                {hasAudio && (
                  <button
                    onClick={(e) => handleDownload(e, 'audio')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    aria-label="Download audio"
                    title="Download Audio"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </button>
                )}
                
                {hasVideo && (
                  <button
                    onClick={(e) => handleDownload(e, 'video')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    aria-label="Download video"
                    title="Download Video"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </button>
                )}

                {hasNotes && (
                  <button
                    onClick={(e) => handleDownload(e, 'notes')}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    aria-label="Download sermon notes"
                    title="Download Notes"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label={`Share ${title}`}
              title="Share Sermon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default SermonCard;