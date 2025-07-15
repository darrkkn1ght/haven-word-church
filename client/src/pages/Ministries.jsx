import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Heart, 
  BookOpen, 
  Music, 
  Baby, 
  UserCheck, 
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Filter,
  Search,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MinistryCard from '../components/cards/MinistryCard';
import Button from '../components/ui/Button';
import PropTypes from 'prop-types';

/**
 * Ministries Page Component
 * Displays church ministries with filtering, search, and detailed information
 * Features Nigerian church context and ministry programs
 */
const Ministries = () => {
  // State management
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState(null);

  // Ministry categories for filtering
  const categories = [
    { value: 'all', label: 'All Ministries', icon: Users },
    { value: 'children', label: 'Children & Youth', icon: Baby },
    { value: 'worship', label: 'Worship & Music', icon: Music },
    { value: 'outreach', label: 'Outreach & Missions', icon: Heart },
    { value: 'discipleship', label: 'Discipleship', icon: BookOpen },
    { value: 'fellowship', label: 'Fellowship Groups', icon: UserCheck }
  ];

  // Mission group data (real ministries)
  const mockMinistries = [
    {
      id: 1,
      title: 'Haven Teens and Children Mission',
      category: 'children',
      tags: ['children', 'teens'],
      description: 'Helping teens and children grow in Christ through fun, interactive activities.',
      fullDescription: 'Helping teens and children grow in Christ through fun, interactive activities. We provide a safe and engaging environment for spiritual growth and friendship.',
      image: '/api/placeholder/600/400',
      leader: '',
      contact: {
        phone: '',
        email: ''
      },
      meetingTime: '',
      location: '',
      ageGroup: 'Children & Teens',
      members: null,
      activities: [
        'Bible Stories',
        'Worship Songs',
        'Games',
        'Arts & Crafts'
      ],
      upcomingEvents: []
    },
    {
      id: 2,
      title: 'Church Planting Mission',
      category: 'outreach',
      tags: ['outreach', 'all ages'],
      description: 'Spreading the gospel through new church plants and outreach efforts.',
      fullDescription: 'Spreading the gospel through new church plants and outreach efforts. We are passionate about reaching new communities for Christ.',
      image: '/api/placeholder/600/400',
      leader: '',
      contact: {
        phone: '',
        email: ''
      },
      meetingTime: '',
      location: '',
      ageGroup: 'All ages',
      members: null,
      activities: [
        'Evangelism',
        'Community Service',
        'Discipleship Training'
      ],
      upcomingEvents: []
    },
    {
      id: 3,
      title: 'Flames Mission',
      category: 'youth',
      tags: ['youth', 'teens'],
      description: 'Raising a generation of passionate, on-fire youths for Christ.',
      fullDescription: 'Raising a generation of passionate, on-fire youths for Christ. We empower young people to lead and serve with zeal.',
      image: '/api/placeholder/600/400',
      leader: '',
      contact: {
        phone: '',
        email: ''
      },
      meetingTime: '',
      location: '',
      ageGroup: 'Teens & Youth',
      members: null,
      activities: [
        'Youth Services',
        'Prayer Meetings',
        'Leadership Training'
      ],
      upcomingEvents: []
    },
    {
      id: 4,
      title: 'Campus Fellowship Mission',
      category: 'fellowship',
      tags: ['students', 'young adults'],
      description: 'Bringing Christ to the campuses and empowering students.',
      fullDescription: 'Bringing Christ to the campuses and empowering students. We foster spiritual growth and mentorship for students and young adults.',
      image: '/api/placeholder/600/400',
      leader: '',
      contact: {
        phone: '',
        email: ''
      },
      meetingTime: '',
      location: '',
      ageGroup: 'Students & Young Adults',
      members: null,
      activities: [
        'Campus Bible Study',
        'Worship Nights',
        'Mentorship'
      ],
      upcomingEvents: []
    },
    {
      id: 5,
      title: 'Anagkazo Mission',
      category: 'outreach',
      tags: ['evangelism', 'all ages'],
      description: 'A mission focused on aggressive evangelism and soul winning.',
      fullDescription: 'A mission focused on aggressive evangelism and soul winning. We are committed to reaching the lost through various outreach events.',
      image: '/api/placeholder/600/400',
      leader: '',
      contact: {
        phone: '',
        email: ''
      },
      meetingTime: '',
      location: '',
      ageGroup: 'All ages',
      members: null,
      activities: [
        'Street Preaching',
        'Gospel Campaigns',
        'Outreach Events'
      ],
      upcomingEvents: []
    }
  ];

  // Load ministries data
  useEffect(() => {
    const loadMinistries = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMinistries(mockMinistries);
      } catch (err) {
        setError('Failed to load ministries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMinistries();
  }, [mockMinistries]);

  // Filter ministries based on search and category
  const filteredMinistries = ministries.filter(ministry => {
    const matchesSearch = ministry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ministry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ministry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle ministry selection for detailed view
  const handleMinistrySelect = (ministry) => {
    setSelectedMinistry(ministry);
    // Scroll to top when opening detailed view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ministry detail modal/view
  const MinistryDetailView = ({ ministry, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={ministry.image} 
            alt={ministry.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            ×
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {categories.find(cat => cat.value === ministry.category)?.icon && 
              React.createElement(categories.find(cat => cat.value === ministry.category).icon, 
              { className: "h-6 w-6 text-blue-600" })}
            <h2 className="text-3xl font-bold text-gray-900">{ministry.title}</h2>
          </div>
          
          <p className="text-gray-600 text-lg mb-6">{ministry.fullDescription}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Ministry Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-gray-500" />
                  <span><strong>Leader:</strong> {ministry.leader}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span><strong>Meeting Time:</strong> {ministry.meetingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span><strong>Location:</strong> {ministry.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span><strong>Members:</strong> {ministry.members}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-gray-500" />
                  <span><strong>Age Group:</strong> {ministry.ageGroup}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <a href={`tel:${ministry.contact.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {ministry.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <a href={`mailto:${ministry.contact.email}`} className="text-blue-600 hover:underline">
                    {ministry.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Activities & Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ministry.activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>
          
          {ministry.upcomingEvents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upcoming Events</h3>
              {ministry.upcomingEvents.map((event, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  </div>
                  <p className="text-gray-600 mb-1">{event.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserCheck className="h-5 w-5" />}
            >
              Join Ministry
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Mail className="h-5 w-5" />}
            >
              Contact Leader
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Helmet>
          <title>Ministries - Haven Word Church</title>
          <meta name="description" content="Discover the various ministries at Haven Word Church and find your place to serve and grow." />
        </Helmet>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Ministries - Haven Word Church</title>
        </Helmet>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Ministries - Haven Word Church</title>
        <meta name="description" content="Discover the various ministries at Haven Word Church in Ibadan. Find your place to serve, grow, and connect with fellow believers." />
        <meta name="keywords" content="church ministries, Haven Word Church, Ibadan church, Christian ministry, volunteer, serve" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Ministries
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover your place to serve, grow, and connect with God and others. 
              Every believer has a unique calling and gifting to contribute to the body of Christ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Users className="h-5 w-5" />}
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Find Your Ministry
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Heart className="h-5 w-5" />}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600"
              >
                Volunteer Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ministries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Filter Toggle for Mobile */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="md"
              leftIcon={<Filter className="h-5 w-5" />}
              rightIcon={showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              className="lg:hidden"
            >
              Filters
            </Button>

            {/* Category Filter */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-auto`}>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      variant={selectedCategory === category.value ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={<Icon className="h-4 w-4" />}
                      className="text-sm font-medium"
                    >
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {filteredMinistries.length} of {ministries.length} ministries
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMinistries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No ministries found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your search terms or category filter.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:underline"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMinistries.map((ministry) => (
                <div key={ministry.id} className="group">
                  <MinistryCard 
                    ministry={ministry}
                    onClick={() => handleMinistrySelect(ministry)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <MinistryDetailView 
          ministry={selectedMinistry}
          onClose={() => setSelectedMinistry(null)}
        />
      )}
    </div>
  );
};

// PropTypes validation
Ministries.propTypes = {
  ministry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    fullDescription: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    leader: PropTypes.string,
    contact: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string
    }),
    meetingTime: PropTypes.string,
    location: PropTypes.string,
    ageGroup: PropTypes.string,
    members: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    activities: PropTypes.arrayOf(PropTypes.string).isRequired,
    upcomingEvents: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default Ministries;