import { useState, useEffect, useCallback, useRef } from 'react';
import { format, parseISO, isValid, isAfter, isBefore, addDays, addHours, addMinutes } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * useContentScheduler Hook
 * 
 * Comprehensive content scheduling management
 * Supports timezone handling, scheduling rules, and publication management
 * 
 * @param {string} contentType - Type of content (blog, sermon, event, etc.)
 * @param {string} contentId - Unique identifier for the content
 * @param {Object} options - Configuration options
 * @returns {Object} Scheduling management functions and state
 */
export const useContentScheduler = (contentType, contentId, options = {}) => {
  const {
    timezone = 'Africa/Lagos', // Nigerian timezone
    minScheduleTime = 15, // Minimum minutes in advance
    maxScheduleTime = 365, // Maximum days in advance
    defaultScheduleTime = '09:00', // Default time for scheduling
    enableRecurring = false,
    enableTimeSlots = true
  } = options;

  // State
  const [scheduledContent, setScheduledContent] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [blackoutDates, setBlackoutDates] = useState([]);

  // Refs
  const scheduleCheckInterval = useRef(null);

  // Predefined time slots for church content
  const defaultTimeSlots = [
    { time: '06:00', label: 'Early Morning (6:00 AM)', type: 'devotional' },
    { time: '09:00', label: 'Morning (9:00 AM)', type: 'general' },
    { time: '12:00', label: 'Noon (12:00 PM)', type: 'general' },
    { time: '15:00', label: 'Afternoon (3:00 PM)', type: 'general' },
    { time: '18:00', label: 'Evening (6:00 PM)', type: 'service' },
    { time: '20:00', label: 'Night (8:00 PM)', type: 'prayer' }
  ];

  // Blackout dates (holidays, special events, etc.)
  const defaultBlackoutDates = [
    { date: '2024-12-25', reason: 'Christmas Day' },
    { date: '2024-12-26', reason: 'Boxing Day' },
    { date: '2025-01-01', reason: 'New Year Day' },
    { date: '2025-04-18', reason: 'Good Friday' },
    { date: '2025-04-20', reason: 'Easter Sunday' }
  ];

  /**
   * Initialize time slots and blackout dates
   */
  useEffect(() => {
    setTimeSlots(defaultTimeSlots);
    setBlackoutDates(defaultBlackoutDates);
  }, []);

  /**
   * Convert local time to UTC
   */
  const localToUTC = useCallback((localDate, localTime) => {
    try {
      const dateTimeString = `${localDate}T${localTime}`;
      const localDateTime = parseISO(dateTimeString);
      return zonedTimeToUtc(localDateTime, timezone);
    } catch (error) {
      console.error('Error converting to UTC:', error);
      return null;
    }
  }, [timezone]);

  /**
   * Convert UTC to local time
   */
  const utcToLocal = useCallback((utcDate) => {
    try {
      return utcToZonedTime(utcDate, timezone);
    } catch (error) {
      console.error('Error converting from UTC:', error);
      return null;
    }
  }, [timezone]);

  /**
   * Validate schedule date and time
   */
  const validateSchedule = useCallback((date, time) => {
    const now = new Date();
    const scheduleDate = localToUTC(date, time);
    
    if (!scheduleDate) {
      return { valid: false, error: 'Invalid date or time format' };
    }

    // Check if date is in the past
    if (isBefore(scheduleDate, now)) {
      return { valid: false, error: 'Schedule date cannot be in the past' };
    }

    // Check minimum advance time
    const minAdvance = addMinutes(now, minScheduleTime);
    if (isBefore(scheduleDate, minAdvance)) {
      return { valid: false, error: `Schedule must be at least ${minScheduleTime} minutes in advance` };
    }

    // Check maximum advance time
    const maxAdvance = addDays(now, maxScheduleTime);
    if (isAfter(scheduleDate, maxAdvance)) {
      return { valid: false, error: `Schedule cannot be more than ${maxScheduleTime} days in advance` };
    }

    // Check blackout dates
    const isBlackoutDate = blackoutDates.some(blackout => 
      format(parseISO(blackout.date), 'yyyy-MM-dd') === date
    );
    if (isBlackoutDate) {
      return { valid: false, error: 'This date is not available for scheduling' };
    }

    return { valid: true, scheduleDate };
  }, [localToUTC, minScheduleTime, maxScheduleTime, blackoutDates]);

  /**
   * Schedule content for publication
   */
  const scheduleContent = useCallback(async (content, scheduleDate, scheduleTime, metadata = {}) => {
    try {
      setIsScheduling(true);
      setScheduleError(null);

      // Validate schedule
      const validation = validateSchedule(scheduleDate, scheduleTime);
      if (!validation.valid) {
        setScheduleError(validation.error);
        return false;
      }

      const scheduleData = {
        contentId,
        contentType,
        content,
        scheduledFor: validation.scheduleDate,
        localDate: scheduleDate,
        localTime: scheduleTime,
        timezone,
        metadata: {
          ...metadata,
          scheduledAt: new Date().toISOString(),
          scheduledBy: 'user', // Will be replaced with actual user ID
          status: 'scheduled'
        }
      };

      // Save to localStorage for now (in real app, this would be an API call)
      const existingSchedules = JSON.parse(localStorage.getItem('scheduledContent') || '[]');
      const updatedSchedules = [...existingSchedules, scheduleData];
      localStorage.setItem('scheduledContent', JSON.stringify(updatedSchedules));

      setScheduledContent(updatedSchedules);
      setCurrentSchedule(scheduleData);

      return true;
    } catch (error) {
      console.error('Error scheduling content:', error);
      setScheduleError('Failed to schedule content');
      return false;
    } finally {
      setIsScheduling(false);
    }
  }, [contentId, contentType, validateSchedule, timezone]);

  /**
   * Update existing schedule
   */
  const updateSchedule = useCallback(async (scheduleId, newDate, newTime, metadata = {}) => {
    try {
      setIsScheduling(true);
      setScheduleError(null);

      // Validate new schedule
      const validation = validateSchedule(newDate, newTime);
      if (!validation.valid) {
        setScheduleError(validation.error);
        return false;
      }

      const existingSchedules = JSON.parse(localStorage.getItem('scheduledContent') || '[]');
      const scheduleIndex = existingSchedules.findIndex(s => s.contentId === scheduleId);
      
      if (scheduleIndex === -1) {
        setScheduleError('Schedule not found');
        return false;
      }

      const updatedSchedule = {
        ...existingSchedules[scheduleIndex],
        scheduledFor: validation.scheduleDate,
        localDate: newDate,
        localTime: newTime,
        metadata: {
          ...existingSchedules[scheduleIndex].metadata,
          ...metadata,
          updatedAt: new Date().toISOString()
        }
      };

      existingSchedules[scheduleIndex] = updatedSchedule;
      localStorage.setItem('scheduledContent', JSON.stringify(existingSchedules));

      setScheduledContent(existingSchedules);
      setCurrentSchedule(updatedSchedule);

      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      setScheduleError('Failed to update schedule');
      return false;
    } finally {
      setIsScheduling(false);
    }
  }, [validateSchedule]);

  /**
   * Cancel scheduled content
   */
  const cancelSchedule = useCallback(async (scheduleId) => {
    try {
      const existingSchedules = JSON.parse(localStorage.getItem('scheduledContent') || '[]');
      const updatedSchedules = existingSchedules.filter(s => s.contentId !== scheduleId);
      
      localStorage.setItem('scheduledContent', JSON.stringify(updatedSchedules));
      setScheduledContent(updatedSchedules);
      
      if (currentSchedule?.contentId === scheduleId) {
        setCurrentSchedule(null);
      }

      return true;
    } catch (error) {
      console.error('Error canceling schedule:', error);
      return false;
    }
  }, [currentSchedule]);

  /**
   * Get available time slots for a specific date
   */
  const getAvailableTimeSlots = useCallback((date) => {
    const now = new Date();
    const selectedDate = parseISO(date);
    
    // If date is today, filter out past times
    const isToday = format(now, 'yyyy-MM-dd') === date;
    
    return timeSlots.filter(slot => {
      if (!isToday) return true;
      
      const slotDateTime = localToUTC(date, slot.time);
      return slotDateTime && isAfter(slotDateTime, now);
    });
  }, [timeSlots, localToUTC]);

  /**
   * Get suggested schedule times based on content type
   */
  const getSuggestedTimes = useCallback((contentType) => {
    const suggestions = {
      blog: [
        { time: '09:00', reason: 'Morning reading time' },
        { time: '12:00', reason: 'Lunch break engagement' },
        { time: '18:00', reason: 'Evening relaxation' }
      ],
      sermon: [
        { time: '06:00', reason: 'Early morning devotion' },
        { time: '09:00', reason: 'Sunday service time' },
        { time: '18:00', reason: 'Evening service' }
      ],
      event: [
        { time: '09:00', reason: 'Morning events' },
        { time: '14:00', reason: 'Afternoon activities' },
        { time: '18:00', reason: 'Evening programs' }
      ],
      announcement: [
        { time: '08:00', reason: 'Start of day' },
        { time: '12:00', reason: 'Midday update' },
        { time: '17:00', reason: 'End of day' }
      ]
    };

    return suggestions[contentType] || suggestions.blog;
  }, []);

  /**
   * Check for scheduling conflicts
   */
  const checkConflicts = useCallback((date, time, excludeId = null) => {
    const scheduleDateTime = localToUTC(date, time);
    if (!scheduleDateTime) return [];

    const conflicts = scheduledContent.filter(schedule => {
      if (excludeId && schedule.contentId === excludeId) return false;
      
      const scheduleTime = new Date(schedule.scheduledFor);
      const timeDiff = Math.abs(scheduleTime - scheduleDateTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Consider it a conflict if within 2 hours
      return hoursDiff < 2;
    });

    return conflicts;
  }, [scheduledContent, localToUTC]);

  /**
   * Get scheduling statistics
   */
  const getSchedulingStats = useCallback(() => {
    const now = new Date();
    const upcoming = scheduledContent.filter(s => 
      new Date(s.scheduledFor) > now
    ).length;
    
    const past = scheduledContent.filter(s => 
      new Date(s.scheduledFor) <= now
    ).length;

    const today = scheduledContent.filter(s => 
      format(new Date(s.scheduledFor), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
    ).length;

    return {
      total: scheduledContent.length,
      upcoming,
      past,
      today
    };
  }, [scheduledContent]);

  /**
   * Load scheduled content on mount
   */
  useEffect(() => {
    try {
      const savedSchedules = JSON.parse(localStorage.getItem('scheduledContent') || '[]');
      const contentSchedules = savedSchedules.filter(s => 
        s.contentType === contentType && s.contentId === contentId
      );
      
      setScheduledContent(savedSchedules);
      if (contentSchedules.length > 0) {
        setCurrentSchedule(contentSchedules[0]);
      }
    } catch (error) {
      console.error('Error loading scheduled content:', error);
    }
  }, [contentType, contentId]);

  /**
   * Set up periodic schedule checking
   */
  useEffect(() => {
    scheduleCheckInterval.current = setInterval(() => {
      const now = new Date();
      const dueSchedules = scheduledContent.filter(schedule => {
        const scheduleTime = new Date(schedule.scheduledFor);
        return scheduleTime <= now && schedule.metadata.status === 'scheduled';
      });

      if (dueSchedules.length > 0) {
        // In a real app, this would trigger publication
        console.log('Schedules due for publication:', dueSchedules);
      }
    }, 60000); // Check every minute

    return () => {
      if (scheduleCheckInterval.current) {
        clearInterval(scheduleCheckInterval.current);
      }
    };
  }, [scheduledContent]);

  return {
    // State
    scheduledContent,
    currentSchedule,
    isScheduling,
    scheduleError,
    timeSlots,
    blackoutDates,

    // Core functions
    scheduleContent,
    updateSchedule,
    cancelSchedule,

    // Utility functions
    validateSchedule,
    getAvailableTimeSlots,
    getSuggestedTimes,
    checkConflicts,
    getSchedulingStats,

    // Time conversion
    localToUTC,
    utcToLocal,

    // Configuration
    timezone,
    minScheduleTime,
    maxScheduleTime
  };
};

export default useContentScheduler; 