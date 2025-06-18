import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import EventCard from '../components/cards/EventCard';
import RSVPForm from '../components/forms/RSVPForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Events Page Component
 * Displays upcoming and past church events with filtering, search, and RSVP functionality
 * Includes Nigerian church context and local time considerations
 */
const Events = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // Event categories for filtering
  const eventCategories = [
    { key: 'upcoming', label: 'Upcoming Events', count: 0 },
    { key: 'worship', label: 'Worship Services', count: 0 },
    { key: 'fellowship', label: 'Fellowship', count: 0 },
    { key: 'outreach', label: 'Outreach', count: 0 },
    { key: 'youth', label: 'Youth Ministry', count: 0 },
    { key: 'past', label: 'Past Events', count: 0 }
  ];

  // Mock events data (in real app, this would come from API)
  const mockEvents = [
    {
      id: 1,
      title: 'Sunday Worship Service',
      description: 'Join us for a powerful time of worship, prayer, and the Word. Experience God\'s presence as we gather as one family in Christ.',
      category: 'worship',
      date: '2024-12-22',
      time: '9:00 AM',
      endTime: '11:30 AM',
      location: 'Main Sanctuary',
      address: 'Haven Word Church, Ring Road, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: true,
      capacity: 500,
      registered: 0,
      tags: ['worship', 'sermon', 'fellowship'],
      pastor: 'Pastor Anthonia Amadi',
      recurring: 'Weekly'
    },
    {
      id: 2,
      title: 'Christmas Carol Service',
      description: 'Celebrate the birth of our Lord Jesus Christ with beautiful carols, dramatic presentations, and a special Christmas message.',
      category: 'worship',
      date: '2024-12-24',
      time: '6:00 PM',
      endTime: '8:00 PM',
      location: 'Main Sanctuary',
      address: 'Haven Word Church, Ring Road, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: true,
      capacity: 600,
      registered: 234,
      tags: ['christmas', 'carols', 'special service'],
      pastor: 'Pastor Anthonia Amadi',
      specialGuests: ['Haven Word Choir', 'Youth Drama Team']
    },
    {
      id: 3,
      title: 'New Year Prayer & Fasting',
      description: '21 days of prayer and fasting to begin the new year. Join us as we seek God\'s face for breakthrough and direction.',
      category: 'fellowship',
      date: '2025-01-01',
      time: '6:00 AM',
      endTime: '8:00 AM',
      location: 'Prayer Garden',
      address: 'Haven Word Church, Ring Road, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: false,
      capacity: 200,
      registered: 89,
      tags: ['prayer', 'fasting', 'new year'],
      duration: '21 Days',
      requirements: ['Commitment to daily attendance', 'Prayer guide provided']
    },
    {
      id: 4,
      title: 'Youth Empowerment Summit',
      description: 'Empowering the next generation with practical skills, spiritual growth, and leadership development for Nigerian youth.',
      category: 'youth',
      date: '2025-01-15',
      time: '10:00 AM',
      endTime: '4:00 PM',
      location: 'Fellowship Hall',
      address: 'Haven Word Church, Ring Road, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: true,
      capacity: 150,
      registered: 67,
      tags: ['youth', 'empowerment', 'leadership'],
      targetAge: '15-35 years',
      speakers: ['Pastor David Okafor', 'Sister Grace Adeyemi'],
      registration: 'Required'
    },
    {
      id: 5,
      title: 'Community Outreach - Agodi Gate',
      description: 'Reaching out to our community with love, food distribution, medical screening, and the Gospel message.',
      category: 'outreach',
      date: '2025-01-25',
      time: '8:00 AM',
      endTime: '2:00 PM',
      location: 'Agodi Gate Community',
      address: 'Agodi Gate, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: false,
      capacity: 100,
      registered: 45,
      tags: ['outreach', 'community', 'evangelism'],
      volunteer: true,
      requirements: ['Transportation provided', 'Lunch included']
    },
    {
      id: 6,
      title: 'Marriage Enrichment Seminar',
      description: 'Strengthening marriages through biblical principles, practical wisdom, and couple interaction sessions.',
      category: 'fellowship',
      date: '2025-02-14',
      time: '2:00 PM',
      endTime: '6:00 PM',
      location: 'Conference Room',
      address: 'Haven Word Church, Ring Road, Ibadan, Oyo State',
      image: '/api/placeholder/600/300',
      featured: false,
      capacity: 80,
      registered: 32,
      tags: ['marriage', 'couples', 'relationships'],
      targetAudience: 'Married couples',
      facilitators: ['Pastor & Mrs. Adebayo'],
      cost: 'Free for members'
    }
  ];

  /**
   * Initialize events data and set up filtering
   */
  useEffect(() => {
    const initializeEvents = () => {
      try {
        setLoading(true);
        
        // In real app, this would be an API call
        setTimeout(() => {
          const currentDate = new Date();
          const eventsWithStatus = mockEvents.map(event => ({
            ...event,
            isPast: new Date(event.date) < currentDate,
            isToday: new Date(event.date).toDateString() === currentDate.toDateString()
          }));
          
          setEvents(eventsWithStatus);
          setFilteredEvents(eventsWithStatus.filter(event => !event.isPast));
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    initializeEvents();
  }, []);

  /**
   * Filter events based on active filter and search term
   */
  useEffect(() => {
    let filtered = [...events];

    // Apply category filter
    if (activeFilter === 'upcoming') {
      filtered = [];
    } else if (activeFilter === 'past') {
      filtered = filtered.filter(event => event.isPast);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(event => event.category === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [activeFilter, searchTerm, events]);

  /**
   * Handle RSVP for an event
   */
  const handleRSVP = (event) => {
    setSelectedEvent(event);
    setShowRSVPModal(true);
  };

  /**
   * Handle successful RSVP submission
   */
  const handleRSVPSuccess = (rsvpData) => {
    // Update event registration count
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === selectedEvent.id
          ? { ...event, registered: event.registered + 1 }
          : event
      )
    );
    
    setShowRSVPModal(false);
    setSelectedEvent(null);
  };

  // Pagination calculations
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Events - Haven Word Church"
          description="Join us for upcoming church events, worship services, and community activities at Haven Word Church, Ibadan."
          keywords="church events, worship services, Ibadan church, Haven Word Church events"
        />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Events - Haven Word Church"
          description="Join us for upcoming church events, worship services, and community activities at Haven Word Church, Ibadan."
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Events</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEOHead 
        title="Events - Haven Word Church"
        description="Join us for upcoming church events, worship services, fellowship activities, and community outreach programs at Haven Word Church, Ibadan."
        keywords="church events, worship services, fellowship, youth ministry, outreach, Ibadan church, Haven Word Church"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Church Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Join us for worship, fellowship, and community activities that strengthen our faith and bonds
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Regular Services</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Community Outreach</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Special Programs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4 inline-block mr-2" />
              Upcoming
            </button>
            <button
              onClick={() => setActiveFilter('worship')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'worship'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Worship
            </button>
            <button
              onClick={() => setActiveFilter('fellowship')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'fellowship'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Fellowship
            </button>
            <button
              onClick={() => setActiveFilter('youth')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'youth'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Youth
            </button>
            <button
              onClick={() => setActiveFilter('outreach')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'outreach'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Outreach
            </button>
            <button
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {currentEvents.length} of {filteredEvents.length} events
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Events Grid */}
          {currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={() => handleRSVP(event)}
                  showRSVPButton={!event.isPast}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? `No events match your search for "${searchTerm}"`
                  : 'No events available for the selected filter'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-50 dark:bg-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Connected
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't miss out on any of our events. Subscribe to our newsletter or follow us on social media for the latest updates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Subscribe to Newsletter
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-white">
              View Calendar
            </button>
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      {showRSVPModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                RSVP for {selectedEvent.title}
              </h3>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.time} - {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              <RSVPForm
                event={selectedEvent}
                onSuccess={handleRSVPSuccess}
                onCancel={() => {
                  setShowRSVPModal(false);
                  setSelectedEvent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;