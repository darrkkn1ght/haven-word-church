import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { 
  getMyEvents, 
  rsvpToEvent 
} from '../../services/memberService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  CheckCircle,
  XCircle,
  HelpCircle,
  Edit,
  Eye,
  Share2,
  Download,
  ChevronRight
} from 'lucide-react';

const MyEvents = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  
  // Modal states
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Form states
  const [rsvpData, setRsvpData] = useState({
    status: 'going',
    guests: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // RSVP status options
  const rsvpStatusOptions = [
    { value: 'going', label: 'I\'m Going', icon: CheckCircle, color: 'text-green-600' },
    { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'text-yellow-600' },
    { value: 'not_going', label: 'Not Going', icon: XCircle, color: 'text-red-600' }
  ];

  // Event status options
  const eventStatusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ];

  /**
   * Fetch events on component mount and filter changes
   */
  useEffect(() => {
    fetchEvents();
  }, [currentPage, filters]);

  /**
   * Fetch events from API
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await getMyEvents(params);
      setEvents(response.events);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle RSVP form changes
   */
  const handleRSVPChange = (e) => {
    const { name, value } = e.target;
    setRsvpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  /**
   * Handle RSVP update
   */
  const handleRSVPUpdate = async () => {
    try {
      setSubmitting(true);
      await rsvpToEvent(selectedEvent._id, rsvpData);
      
      showNotification('RSVP updated successfully', 'success');
      setShowRSVPModal(false);
      setSelectedEvent(null);
      setRsvpData({ status: 'going', guests: 0 });
      fetchEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      showNotification('Failed to update RSVP', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open RSVP modal
   */
  const openRSVPModal = (event) => {
    setSelectedEvent(event);
    // Find current RSVP status
    const currentRSVP = event.rsvps.find(rsvp => rsvp.user === user.id);
    setRsvpData({
      status: currentRSVP?.status || 'going',
      guests: currentRSVP?.guests || 0
    });
    setShowRSVPModal(true);
  };

  /**
   * Get RSVP status badge
   */
  const getRSVPStatusBadge = (status) => {
    const statusConfig = rsvpStatusOptions.find(option => option.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${statusConfig.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  /**
   * Get event type badge
   */
  const getEventTypeBadge = (type) => {
    const styles = {
      'service': 'bg-green-100 text-green-800',
      'ministry': 'bg-blue-100 text-blue-800',
      'special': 'bg-purple-100 text-purple-800',
      'outreach': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Check if event is upcoming
   */
  const isUpcoming = (eventDate) => {
    return new Date(eventDate) > new Date();
  };

  /**
   * Get current RSVP for user
   */
  const getCurrentRSVP = (event) => {
    return event.rsvps.find(rsvp => rsvp.user === user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading events..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Events - Haven Word Church</title>
        <meta name="description" content="View and manage your event RSVPs and upcoming church events." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b mt-20 sm:mt-24 md:mt-28">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                <p className="text-gray-600 mt-1">View and manage your event RSVPs</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => window.location.href = '/events'}
                  variant="primary"
                  size="md"
                  className="flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse All Events
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {eventStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ status: 'all' });
                    setCurrentPage(1);
                  }}
                  variant="ghost"
                  size="md"
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Events ({total})
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 mb-6">
                    {filters.status !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'You haven\'t RSVP\'d to any events yet.'
                    }
                  </p>
                  {filters.status === 'all' && (
                    <Button
                      onClick={() => window.location.href = '/events'}
                      variant="primary"
                      size="md"
                    >
                      Browse Events
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event) => {
                    const currentRSVP = getCurrentRSVP(event);
                    const upcoming = isUpcoming(event.date);
                    
                    return (
                      <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                              {getEventTypeBadge(event.type)}
                              {currentRSVP && getRSVPStatusBadge(currentRSVP.status)}
                            </div>
                            
                            <p className="text-gray-600 mb-4">{event.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                {formatTime(event.time)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {event.location}
                              </div>
                            </div>
                            
                            {currentRSVP && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Your RSVP</p>
                                    <p className="text-sm text-gray-600">
                                      {rsvpStatusOptions.find(opt => opt.value === currentRSVP.status)?.label}
                                      {currentRSVP.guests > 0 && ` • ${currentRSVP.guests} guest${currentRSVP.guests > 1 ? 's' : ''}`}
                                    </p>
                                  </div>
                                  {upcoming && (
                                    <Button
                                      onClick={() => openRSVPModal(event)}
                                      variant="ghost"
                                      size="sm"
                                      className="flex items-center"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Update
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              onClick={() => window.location.href = `/events/${event._id}`}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {upcoming && !currentRSVP && (
                              <Button
                                onClick={() => openRSVPModal(event)}
                                variant="primary"
                                size="sm"
                                className="flex items-center"
                              >
                                RSVP
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="ghost"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="ghost"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      <Modal
        isOpen={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
        title={`RSVP to ${selectedEvent?.title}`}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Will you attend this event? *
            </label>
            <div className="space-y-3">
              {rsvpStatusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={rsvpData.status === option.value}
                      onChange={handleRSVPChange}
                      className="mr-3"
                    />
                    <Icon className={`w-5 h-5 mr-3 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          
          {rsvpData.status === 'going' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Additional Guests
              </label>
              <input
                type="number"
                name="guests"
                value={rsvpData.guests}
                onChange={handleRSVPChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">How many additional people will you bring?</p>
            </div>
          )}
          
          {selectedEvent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><Calendar className="w-4 h-4 inline mr-2" />{formatDate(selectedEvent.date)}</p>
                <p><Clock className="w-4 h-4 inline mr-2" />{formatTime(selectedEvent.time)}</p>
                <p><MapPin className="w-4 h-4 inline mr-2" />{selectedEvent.location}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowRSVPModal(false)}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRSVPUpdate}
            variant="primary"
            size="md"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update RSVP'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default MyEvents;
