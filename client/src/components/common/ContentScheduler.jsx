import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Edit,
  Trash2,
  Globe
} from 'lucide-react';
import Button from '../ui/Button';
import useContentScheduler from '../../hooks/useContentScheduler';

/**
 * ContentScheduler Component
 * 
 * Comprehensive content scheduling interface
 * Provides date/time selection, timezone handling, and scheduling management
 * 
 * @param {Object} props - Component props
 * @param {string} props.contentType - Type of content (blog, sermon, event, etc.)
 * @param {string} props.contentId - Unique identifier for the content
 * @param {Object} props.content - Content to be scheduled
 * @param {Function} props.onSchedule - Callback when content is scheduled
 * @param {Function} props.onCancel - Callback when scheduling is cancelled
 * @param {Object} props.options - Scheduling options
 */
const ContentScheduler = ({
  contentType,
  contentId,
  content,
  onSchedule,
  onCancel,
  options = {}
}) => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Scheduling hook
  const {
    currentSchedule,
    isScheduling,
    scheduleError,
    scheduleContent,
    updateSchedule,
    cancelSchedule,
    validateSchedule,
    getAvailableTimeSlots,
    getSuggestedTimes,
    checkConflicts,
    getSchedulingStats,
    timezone
  } = useContentScheduler(contentType, contentId, options);

  // Initialize with tomorrow's date and default time
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTime('09:00');
  }, []);

  /**
   * Handle schedule submission
   */
  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const metadata = {
      notes: scheduleNotes,
      contentType,
      title: content.title || 'Untitled Content'
    };

    const success = await scheduleContent(content, selectedDate, selectedTime, metadata);
    
    if (success) {
      setShowScheduler(false);
      if (onSchedule) {
        onSchedule(content, selectedDate, selectedTime, metadata);
      }
    }
  };

  /**
   * Handle schedule update
   */
  const handleUpdateSchedule = async () => {
    if (!selectedDate || !selectedTime || !currentSchedule) {
      return;
    }

    const metadata = {
      notes: scheduleNotes,
      contentType,
      title: content.title || 'Untitled Content'
    };

    const success = await updateSchedule(currentSchedule.contentId, selectedDate, selectedTime, metadata);
    
    if (success) {
      setShowScheduler(false);
      if (onSchedule) {
        onSchedule(content, selectedDate, selectedTime, metadata);
      }
    }
  };

  /**
   * Handle schedule cancellation
   */
  const handleCancelSchedule = async () => {
    if (!currentSchedule) return;

    const success = await cancelSchedule(currentSchedule.contentId);
    if (success && onCancel) {
      onCancel();
    }
  };

  /**
   * Format date for display
   */
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format time for display
   */
  const formatDisplayTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Get validation status
   */
  const getValidationStatus = () => {
    if (!selectedDate || !selectedTime) {
      return { valid: false, message: 'Please select date and time' };
    }

    const validation = validateSchedule(selectedDate, selectedTime);
    if (!validation.valid) {
      return { valid: false, message: validation.error };
    }

    const conflicts = checkConflicts(selectedDate, selectedTime, currentSchedule?.contentId);
    if (conflicts.length > 0) {
      return { 
        valid: false, 
        message: `Conflicts with ${conflicts.length} other scheduled content` 
      };
    }

    return { valid: true, message: 'Schedule is valid' };
  };

  const validationStatus = getValidationStatus();
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  const suggestedTimes = getSuggestedTimes(contentType);
  const stats = getSchedulingStats();

  return (
    <div className="space-y-4">
      {/* Current Schedule Display */}
      {currentSchedule && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Currently Scheduled
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {formatDisplayDate(currentSchedule.localDate)} at {formatDisplayTime(currentSchedule.localTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(currentSchedule.localDate);
                  setSelectedTime(currentSchedule.localTime);
                  setScheduleNotes(currentSchedule.metadata.notes || '');
                  setShowScheduler(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelSchedule}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      {!currentSchedule && (
        <Button
          variant="outline"
          onClick={() => setShowScheduler(true)}
          className="w-full"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Publication
        </Button>
      )}

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentSchedule ? 'Edit Schedule' : 'Schedule Publication'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose when to publish your {contentType}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowScheduler(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {selectedDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDisplayDate(selectedDate)}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publication Time
              </label>
              
              {/* Quick Time Slots */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      selectedTime === slot.time
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {formatDisplayTime(slot.time)}
                  </button>
                ))}
              </div>

              {/* Custom Time */}
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Suggested Times */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suggested Times for {contentType}
              </h4>
              <div className="space-y-2">
                {suggestedTimes.map((suggestion) => (
                  <button
                    key={suggestion.time}
                    onClick={() => setSelectedTime(suggestion.time)}
                    className="flex items-center justify-between w-full p-2 text-sm text-left border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span>{formatDisplayTime(suggestion.time)}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {suggestion.reason}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                <Globe className="w-4 h-4 mr-1" />
                Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {timezone} (Africa/Lagos)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Schedule Notes
                    </label>
                    <textarea
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Add notes about this schedule..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Validation Status */}
            <div className="mb-6">
              <div className={`flex items-center p-3 rounded-lg ${
                validationStatus.valid
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {validationStatus.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                )}
                <span className={`text-sm ${
                  validationStatus.valid
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {validationStatus.message}
                </span>
              </div>
            </div>

            {/* Scheduling Stats */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scheduling Overview
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Scheduled</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {stats.upcoming}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Upcoming</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {stats.today}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowScheduler(false)}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={currentSchedule ? handleUpdateSchedule : handleSchedule}
                disabled={!validationStatus.valid || isScheduling}
                loading={isScheduling}
              >
                {currentSchedule ? 'Update Schedule' : 'Schedule Publication'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {scheduleError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300 text-sm">
              {scheduleError}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ContentScheduler.propTypes = {
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  onSchedule: PropTypes.func,
  onCancel: PropTypes.func,
  options: PropTypes.object
};

export default ContentScheduler; 