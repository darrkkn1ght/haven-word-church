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
  ArrowRight,
  Filter,
  Search,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MinistryCard from '../components/cards/MinistryCard';

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

  // Mock ministry data (would come from API in real implementation)
  const mockMinistries = [
    {
      id: 1,
      title: 'Children\'s Church',
      category: 'children',
      description: 'Nurturing young hearts with God\'s love through interactive lessons, games, and worship.',
      fullDescription: 'Our Children\'s Church ministry is dedicated to creating a safe, fun, and engaging environment where children aged 3-12 can learn about God\'s love. We use age-appropriate teaching methods, interactive games, crafts, and worship songs to help children understand biblical principles and develop a personal relationship with Jesus Christ.',
      image: '/api/placeholder/600/400',
      leader: 'Sister Funmi Adebayo',
      contact: {
        phone: '+234 803 456 7890',
        email: 'childrens.ministry@havenword.org'
      },
      meetingTime: 'Sundays, 10:00 AM',
      location: 'Children\'s Wing',
      ageGroup: '3-12 years',
      members: 85,
      activities: [
        'Interactive Bible Stories',
        'Worship Songs & Dance',
        'Arts & Crafts',
        'Scripture Memory Games',
        'Character Building Lessons'
      ],
      upcomingEvents: [
        {
          title: 'Children\'s Fun Day',
          date: '2024-07-15',
          description: 'Games, food, and fellowship for all children'
        }
      ]
    },
    {
      id: 2,
      title: 'Youth Ministry',
      category: 'children',
      description: 'Empowering teenagers and young adults to live purposeful lives anchored in Christ.',
      fullDescription: 'Our Youth Ministry serves teenagers and young adults aged 13-25, providing mentorship, discipleship, and opportunities for spiritual growth. We focus on addressing real-life challenges while building strong Christian character and leadership skills.',
      image: '/api/placeholder/600/400',
      leader: 'Pastor Kemi Johnson',
      contact: {
        phone: '+234 805 678 9012',
        email: 'youth@havenword.org'
      },
      meetingTime: 'Saturdays, 4:00 PM',
      location: 'Youth Center',
      ageGroup: '13-25 years',
      members: 120,
      activities: [
        'Youth Service',
        'Bible Study Groups',
        'Leadership Training',
        'Community Service',
        'Career Counseling',
        'Sports & Recreation'
      ],
      upcomingEvents: [
        {
          title: 'Youth Conference 2024',
          date: '2024-08-10',
          description: 'Three-day intensive program for spiritual growth'
        }
      ]
    },
    {
      id: 3,
      title: 'Praise & Worship Team',
      category: 'worship',
      description: 'Leading the congregation in spirit-filled worship through music and song.',
      fullDescription: 'Our Praise & Worship Ministry is committed to creating an atmosphere where God\'s presence is tangibly felt through music. We combine contemporary and traditional Nigerian gospel music to minister to hearts and usher the congregation into God\'s presence.',
      image: '/api/placeholder/600/400',
      leader: 'Minister David Okoro',
      contact: {
        phone: '+234 807 890 1234',
        email: 'worship@havenword.org'
      },
      meetingTime: 'Wednesdays, 6:00 PM (Practice)',
      location: 'Main Sanctuary',
      ageGroup: 'All ages',
      members: 45,
      activities: [
        'Sunday Worship Leading',
        'Weekly Rehearsals',
        'Special Events Ministry',
        'Music Training Classes',
        'Recording Ministry'
      ],
      upcomingEvents: [
        {
          title: 'Worship Night',
          date: '2024-07-20',
          description: 'An evening of praise and worship'
        }
      ]
    },
    {
      id: 4,
      title: 'Women\'s Fellowship',
      category: 'fellowship',
      description: 'Building sisterhood and spiritual growth among women of all ages.',
      fullDescription: 'The Women\'s Fellowship Ministry provides a platform for women to grow spiritually, support each other, and impact their communities. We focus on biblical womanhood, family life, and empowering women to fulfill their God-given purposes.',
      image: '/api/placeholder/600/400',
      leader: 'Deaconess Grace Okafor',
      contact: {
        phone: '+234 809 012 3456',
        email: 'women@havenword.org'
      },
      meetingTime: '2nd Saturday monthly, 10:00 AM',
      location: 'Fellowship Hall',
      ageGroup: 'Adult women',
      members: 150,
      activities: [
        'Monthly Fellowship Meetings',
        'Bible Study Groups',
        'Prayer Meetings',
        'Community Outreach',
        'Skills Development Programs',
        'Marriage & Family Seminars'
      ],
      upcomingEvents: [
        {
          title: 'Women\'s Conference',
          date: '2024-09-14',
          description: 'Annual conference for spiritual empowerment'
        }
      ]
    },
    {
      id: 5,
      title: 'Men\'s Fellowship',
      category: 'fellowship',
      description: 'Equipping men to be godly leaders in their homes and communities.',
      fullDescription: 'The Men\'s Fellowship Ministry focuses on developing godly men who will lead their families and communities with integrity. We provide mentorship, accountability, and practical teaching on biblical manhood.',
      image: '/api/placeholder/600/400',
      leader: 'Elder Samuel Ade',
      contact: {
        phone: '+234 811 234 5678',
        email: 'men@havenword.org'
      },
      meetingTime: '1st Saturday monthly, 6:00 AM',
      location: 'Conference Room',
      ageGroup: 'Adult men',
      members: 95,
      activities: [
        'Monthly Fellowship Breakfast',
        'Bible Study & Discussion',
        'Leadership Development',
        'Community Service Projects',
        'Sports & Recreation',
        'Fatherhood Training'
      ],
      upcomingEvents: [
        {
          title: 'Men\'s Retreat',
          date: '2024-08-25',
          description: 'Weekend retreat for spiritual renewal'
        }
      ]
    },
    {
      id: 6,
      title: 'Evangelism Team',
      category: 'outreach',
      description: 'Sharing the Gospel and reaching the lost in our community and beyond.',
      fullDescription: 'Our Evangelism Ministry is passionate about fulfilling the Great Commission by reaching out to the lost with the Gospel of Jesus Christ. We engage in street evangelism, hospital visits, prison ministry, and community outreach programs.',
      image: '/api/placeholder/600/400',
      leader: 'Evangelist Mary Taiwo',
      contact: {
        phone: '+234 813 456 7890',
        email: 'evangelism@havenword.org'
      },
      meetingTime: 'Saturdays, 2:00 PM',
      location: 'Various locations',
      ageGroup: 'All ages',
      members: 60,
      activities: [
        'Street Evangelism',
        'Hospital Visitations',
        'Prison Ministry',
        'Campus Outreach',
        'Community Programs',
        'Tract Distribution'
      ],
      upcomingEvents: [
        {
          title: 'Community Outreach',
          date: '2024-07-28',
          description: 'Medical mission and evangelism in Ogunpa'
        }
      ]
    },
    {
      id: 7,
      title: 'Bible Study Groups',
      category: 'discipleship',
      description: 'Growing deeper in God\'s Word through systematic study and fellowship.',
      fullDescription: 'Our Bible Study Ministry provides structured learning opportunities for believers to grow in their understanding of Scripture. We offer various study groups covering different books of the Bible, topical studies, and new believer classes.',
      image: '/api/placeholder/600/400',
      leader: 'Pastor Daniel Olumide',
      contact: {
        phone: '+234 815 678 9012',
        email: 'biblestudy@havenword.org'
      },
      meetingTime: 'Wednesdays, 7:00 PM',
      location: 'Multiple Classrooms',
      ageGroup: 'All levels',
      members: 200,
      activities: [
        'Weekly Bible Studies',
        'Book Studies',
        'Topical Studies',
        'New Believer Classes',
        'Leadership Training',
        'Scripture Memorization'
      ],
      upcomingEvents: [
        {
          title: 'Bible Study Rally',
          date: '2024-08-05',
          description: 'Special combined session with guest teacher'
        }
      ]
    },
    {
      id: 8,
      title: 'Choir Ministry',
      category: 'worship',
      description: 'Ministering through harmonious voices lifted in praise to God.',
      fullDescription: 'The Choir Ministry consists of dedicated singers who minister through song during worship services and special events. We focus on both traditional hymns and contemporary Nigerian gospel music, bringing diversity and richness to our worship experience.',
      image: '/api/placeholder/600/400',
      leader: 'Choirmaster Ruth Ogbonna',
      contact: {
        phone: '+234 817 890 1234',
        email: 'choir@havenword.org'
      },
      meetingTime: 'Thursdays, 7:00 PM',
      location: 'Music Room',
      ageGroup: 'All ages',
      members: 35,
      activities: [
        'Sunday Worship Ministry',
        'Special Events Performance',
        'Choir Rehearsals',
        'Voice Training',
        'Music Theory Classes',
        'Recording Projects'
      ],
      upcomingEvents: [
        {
          title: 'Choir Anniversary',
          date: '2024-09-01',
          description: 'Celebrating 10 years of musical ministry'
        }
      ]
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
  }, []);

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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
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
                  <a href={`tel:${ministry.contact.phone}`} className="text-blue-600 hover:underline">
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
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Join Ministry
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Leader
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
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
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 justify-center">
                <Users className="h-5 w-5" />
                Find Your Ministry
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2 justify-center">
                <Heart className="h-5 w-5" />
                Volunteer Today
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-sm">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Category Filter */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-auto`}>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-gray-600">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No ministries found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
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

      {/* Call to Action Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Involved?
          </h2>
          <p className="text-xl mb-8">
            God has equipped every believer with unique gifts and talents. 
            Discover how you can use yours to serve Him and bless others at Haven Word Church.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 justify-center">
              <UserCheck className="h-5 w-5" />
              Take Gifts Assessment
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2 justify-center">
              <Phone className="h-5 w-5" />
              Speak with Pastor
            </button>
          </div>
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

export default Ministries;