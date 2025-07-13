import React, { useState, useMemo, useCallback } from 'react';
import Button from '../ui/Button';

/**
 * Comprehensive Calendar Component for Haven Word Church
 * 
 * Features:
 * - Month/year navigation
 * - Date selection (single or multiple)
 * - Event highlighting
 * - Disabled dates support
 * - Nigerian locale support
 * - Mobile-responsive design
 * - Accessibility compliant
 * - Church event integration ready
 * 
 * @param {Object} props - Component props
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Date[]} props.selectedDates - Multiple selected dates (for multi-select)
 * @param {Function} props.onDateSelect - Date selection handler
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {Date[]} props.disabledDates - Array of disabled dates
 * @param {Object[]} props.events - Array of event objects with date and details
 * @param {boolean} props.multiSelect - Allow multiple date selection
 * @param {boolean} props.showEvents - Show event indicators
 * @param {'en'|'ig'|'yo'|'ha'} props.locale - Language locale
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onMonthChange - Month change handler
 * @param {Function} props.onYearChange - Year change handler
 * @param {boolean} props.highlightToday - Highlight today's date
 * @param {Object} props.customDayRenderer - Custom day cell renderer
 */
const Calendar = ({
  selectedDate,
  selectedDates = [],
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  events = [],
  multiSelect = false,
  showEvents = true,
  locale = 'en',
  className = '',
  onMonthChange,
  onYearChange,
  highlightToday = true,
  customDayRenderer,
  ...rest
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(selectedDate || today);

  // Locale-specific configurations
  const localeConfig = {
    en: {
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      monthsShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    },
    ig: {
      months: [
        'Jenụwarị', 'Febụwarị', 'Maachị', 'Eprel', 'Mee', 'Juun',
        'Julaị', 'Ọgọọst', 'Septemba', 'Ọktoba', 'Novemba', 'Disemba'
      ],
      weekdaysMin: ['Uk', 'Mọ', 'Ti', 'We', 'Tọ', 'Fr', 'Sa']
    },
    yo: {
      months: [
        'Ṣẹ́rẹ́', 'Èrèlè', 'Ẹrẹ̀nà', 'Ìgbé', 'Ẹ̀bibi', 'Òkúdu',
        'Agẹmọ', 'Ògún', 'Owewe', 'Ọ̀wàrà', 'Bélú', 'Ọ̀pẹ̀'
      ],
      weekdaysMin: ['Àì', 'Aj', 'Ìs', 'Ọj', 'Ọj', 'Ẹt', 'Àb']
    },
    ha: {
      months: [
        'Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni',
        'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'
      ],
      weekdaysMin: ['La', 'Li', 'Ta', 'La', 'Al', 'Ju', 'As']
    }
  };

  const currentLocale = localeConfig[locale] || localeConfig.en;

  // Calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Previous month days to fill the calendar
    const prevMonthDays = [];
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    // Next month days to complete the calendar grid
    const nextMonthDays = [];
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
    for (let day = 1; day <= remainingCells; day++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  // Helper functions
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateDisabled = useCallback((date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  }, [minDate, maxDate, disabledDates]);

  const isDateSelected = useCallback((date) => {
    if (multiSelect) {
      return selectedDates.some(selectedDate => isSameDay(date, selectedDate));
    }
    return selectedDate && isSameDay(date, selectedDate);
  }, [selectedDate, selectedDates, multiSelect]);

  const getEventsForDate = useCallback((date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  }, [events]);

  // Event handlers
  const handleDateClick = useCallback((date) => {
    if (isDateDisabled(date)) return;
    onDateSelect?.(date);
  }, [isDateDisabled, onDateSelect]);

  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  }, [currentDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  }, [currentDate, onMonthChange]);

  const handleYearChange = useCallback((increment) => {
    const newDate = new Date(currentDate.getFullYear() + increment, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    onYearChange?.(newDate);
  }, [currentDate, onYearChange]);

  // Day cell renderer
  const renderDay = (dayData) => {
    const { date, isCurrentMonth } = dayData;
    const isToday = highlightToday && isSameDay(date, today);
    const isSelected = isDateSelected(date);
    const isDisabled = isDateDisabled(date);
    const dayEvents = getEventsForDate(date);
    const hasEvents = showEvents && dayEvents.length > 0;

    const dayClasses = `
      relative w-10 h-10 flex items-center justify-center
      text-sm font-medium rounded-lg cursor-pointer
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
      ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
      ${isSelected ? 'bg-blue-600 text-white shadow-md' : ''}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
      ${!isSelected && !isDisabled ? 'hover:bg-gray-100' : ''}
    `.trim();

    if (customDayRenderer) {
      return customDayRenderer(dayData, {
        isToday,
        isSelected,
        isDisabled,
        hasEvents,
        events: dayEvents
      });
    }

    return (
      <Button
        key={date.toISOString()}
        className={dayClasses}
        onClick={() => handleDateClick(date)}
        disabled={isDisabled}
        variant="ghost"
        size="sm"
        aria-label={`${date.getDate()} ${currentLocale.months[date.getMonth()]} ${date.getFullYear()}`}
        aria-pressed={isSelected}
      >
        <span>{date.getDate()}</span>
        
        {/* Event indicators */}
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    event.type === 'service' ? 'bg-green-500' :
                    event.type === 'event' ? 'bg-blue-500' :
                    event.type === 'meeting' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}
                  title={event.title}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              )}
            </div>
          </div>
        )}
      </Button>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`} {...rest}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrevMonth}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            aria-label="Previous month"
          />
          
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentLocale.months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleNextMonth}
            rightIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
            aria-label="Next month"
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleYearChange(-1)}
            aria-label="Previous year"
          >
            {currentDate.getFullYear() - 1}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleYearChange(1)}
            aria-label="Next year"
          >
            {currentDate.getFullYear() + 1}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {currentLocale.weekdaysMin.map((weekday, index) => (
          <div
            key={index}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 uppercase"
          >
            {weekday}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarData.map((dayData, index) => (
          <div key={index}>
            {renderDay(dayData)}
          </div>
        ))}
      </div>

      {/* Legend */}
      {showEvents && events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Services</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Events</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Meetings</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Usage Examples for Documentation
const CalendarExamples = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);

  // Sample church events
  const churchEvents = [
    {
      date: new Date(2024, 11, 25), // Christmas
      title: 'Christmas Service',
      type: 'service'
    },
    {
      date: new Date(2024, 11, 31), // New Year's Eve
      title: 'Watch Night Service',
      type: 'service'
    },
    {
      date: new Date(2025, 0, 15), // January 15
      title: 'Youth Ministry Meeting',
      type: 'meeting'
    },
    {
      date: new Date(2025, 0, 20), // January 20
      title: 'Church Picnic',
      type: 'event'
    }
  ];

  const handleMultiSelect = (date) => {
    setSelectedDates(prev => {
      const isAlreadySelected = prev.some(d => 
        d.getTime() === date.getTime()
      );
      
      if (isAlreadySelected) {
        return prev.filter(d => d.getTime() !== date.getTime());
      } else {
        return [...prev, date];
      }
    });
  };

  return (
    <div className="space-y-8 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Calendar Examples</h3>
      
      {/* Basic Calendar */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Basic Date Picker</h4>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          highlightToday={true}
        />
        <p className="text-sm text-gray-600">
          Selected: {selectedDate.toLocaleDateString()}
        </p>
      </div>

      {/* Church Events Calendar */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Church Events Calendar</h4>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          events={churchEvents}
          showEvents={true}
          highlightToday={true}
        />
      </div>

      {/* Multi-Select Calendar */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Multi-Select Calendar</h4>
        <Calendar
          selectedDates={selectedDates}
          onDateSelect={handleMultiSelect}
          multiSelect={true}
          highlightToday={true}
        />
        <p className="text-sm text-gray-600">
          Selected dates: {selectedDates.length}
        </p>
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';

Calendar.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  selectedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  onDateSelect: PropTypes.func,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  events: PropTypes.arrayOf(PropTypes.object),
  multiSelect: PropTypes.bool,
  showEvents: PropTypes.bool,
  locale: PropTypes.oneOf(['en', 'ig', 'yo', 'ha']),
  className: PropTypes.string,
  onMonthChange: PropTypes.func,
  onYearChange: PropTypes.func,
  highlightToday: PropTypes.bool,
  customDayRenderer: PropTypes.func
};

export default Calendar;
export { CalendarExamples };