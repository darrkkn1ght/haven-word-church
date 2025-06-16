import React, { useState, useEffect } from 'react';
import { Play, Download, Share2, Calendar, Clock, User, BookOpen, Search, Filter, ChevronLeft, ChevronRight, Volume2, Heart, MessageCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SermonCard from '../components/cards/SermonCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Sermons Page Component
 * Displays sermon library with audio/video playback, filtering, search, and sharing functionality
 * Includes Nigerian church context and local pastor information
 */
const Sermons = () => {
  // State management
  const [sermons, setSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredSermon, setFeaturedSermon] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const sermonsPerPage = 9;

  // Sermon series and categories
  const sermonSeries = [
    { key: 'all', label: 'All Series', count: 0 },
    { key: 'faith-foundations', label: 'Faith Foundations', count: 0 },
    { key: 'kingdom-living', label: 'Kingdom Living', count: 0 },
    { key: 'psalms-study', label: 'Psalms Study', count: 0 },
    { key: 'new-testament', label: 'New Testament Journey', count: 0 },
    { key: 'prayer-power', label: 'The Power of Prayer', count: 0 },
    { key: 'family-values', label: 'Family & Relationships', count: 0 }
  ];

  const filterOptions = [
    { key: 'recent', label: 'Most Recent' },
    { key: 'popular', label: 'Most Popular' },
    { key: 'series', label: 'By Series' },
    { key: 'pastor', label: 'By Pastor' }
  ];

  // Mock sermons data (in real app, this would come from API)
  const mockSermons = [
    {
      id: 1,
      title: 'Walking in Faith, Not Fear',
      description: 'In times of uncertainty, God calls us to trust Him completely. Learn how to overcome fear with unwavering faith and discover the peace that comes from trusting in His perfect plan.',
      pastor: 'Pastor Emmanuel Adebayo',
      date: '2024-12-15',
      duration: '45:30',
      series: 'faith-foundations',
      seriesTitle: 'Faith Foundations',
      scripture: '2 Timothy 1:7, Isaiah 41:10',
      audioUrl: '/sermons/audio/walking-in-faith.mp3',
      videoUrl: '/sermons/video/walking-in-faith.mp4',
      thumbnail: '/api/placeholder/600/400',
      featured: true,
      views: 2847,
      likes: 234,
      downloads: 156,
      tags: ['faith', 'fear', 'trust', 'peace'],
      notes: '/sermons/notes/walking-in-faith.pdf',
      transcript: '/sermons/transcripts/walking-in-faith.txt'
    },
    {
      id: 2,
      title: 'The Power of Persistent Prayer',
      description: 'Jesus taught us to pray without ceasing. Discover the transformative power of consistent, persistent prayer and how it changes both circumstances and hearts.',
      pastor: 'Pastor David Okafor',
      date: '2024-12-08',
      duration: '38:45',
      series: 'prayer-power',
      seriesTitle: 'The Power of Prayer',
      scripture: 'Luke 18:1-8, 1 Thessalonians 5:17',
      audioUrl: '/sermons/audio/persistent-prayer.mp3',
      videoUrl: '/sermons/video/persistent-prayer.mp4',
      thumbnail: '/api/placeholder/600/400',
      featured: false,
      views: 1923,
      likes: 187,
      downloads: 89,
      tags: ['prayer', 'persistence', 'breakthrough'],
      notes: '/sermons/notes/persistent-prayer.pdf',
      transcript: '/sermons/transcripts/persistent-prayer.txt'
    },
    {
      id: 3,
      title: 'Psalm 23: The Good Shepherd',
      description: 'Explore the beloved Psalm 23 and discover how Jesus as our Good Shepherd provides, protects, and guides us through every season of life.',
      pastor: 'Pastor Emmanuel Adebayo',
      date: '2024-12-01',
      duration: '42:15',
      series: 'psalms-study',
      seriesTitle: 'Psalms Study',
      scripture: 'Psalm 23, John 10:11-16',
      audioUrl: '/sermons/audio/psalm-23.mp3',
      videoUrl: '/sermons/video/psalm-23.mp4',
      thumbnail: '/api/placeholder/600/400',
      featured: false,
      views: 3156,
      likes: 298,
      downloads: 201,
      tags: ['psalms', 'shepherd', 'guidance', 'protection'],
      notes: '/sermons/notes/psalm-23.pdf',
      transcript: '/sermons/transcripts/psalm-23.txt'
    },
    {
      id: 4,
      title: 'Building Strong Christian Families',
      description: 'God\'s design for the family is beautiful and purposeful. Learn practical principles for building Christ-centered homes that honor God and nurture growth.',
      pastor: 'Pastor & Mrs. Adebayo',
      date: '2024-11-24',
      duration: '51:20',
      series: 'family-values',
      seriesTitle: 'Family & Relationships',
      scripture: 'Ephesians 5:22-33, Proverbs 22:6',
      audioUrl: '/sermons/audio/christian-families.mp3',
      videoUrl: '/sermons/video/christian-families.mp4',
      thumbnail: '/api/placeholder/600/400',
      featured: false,
      views: 2234,
      likes: 167,
      downloads: 134,
      tags: ['family', 'marriage', 'parenting', 'relationships'],
      notes: '/sermons/notes/christian-families.pdf',
      transcript: '/sermons/transcripts/christian-families.txt'
    },
    {
      id: 5,
      title: 'Living as Kingdom Citizens',
      description: 'As followers of Christ, we are citizens of God\'s kingdom. Discover what it means to live with kingdom values in a world that often opposes them.',
      pastor: 'Pastor David Okafor',
      date: '2024-11-17',
      duration: '44:30',
      series: 'kingdom-living',
      seriesTitle: 'Kingdom Living',
      scripture: 'Matthew 5:3-16, Philippians 3:20',
      audioUrl: '/sermons/audio/kingdom-citizens.mp3',
      videoUrl: '/sermons/video/kingdom-citizens.mp4',
      thumbnail: '/api/placeholder/600/400',
      featured: false,
      views: 1876,
      likes: 143,
      downloads: 78,
      tags: ['kingdom', 'citizenship', 'values', 'discipleship'],
      notes: '/sermons/notes/kingdom-citizens.pdf',
      transcript: '/sermons/transcripts/kingdom-citizens.txt'
    },
    {
      id: 6,
      title: 'The Great Commission in Nigeria',
      description: 'Jesus\' command to make disciples applies powerfully to our Nigerian context. Learn how to be effective witnesses in our communities and beyond.',
      pastor: 'Pastor Emmanuel Adebayo',
      date: '2024-11-10',
      duration: '47:45',
      series: 'new-testament',
      seriesTitle: 'New Testament Journey',
      scripture: 'Matthew 28:16-20, Acts 1:8',
      audioUrl: '/sermons/audio/great-commission.mp3',
      videoUrl: '/sermons/video/great-commission.mp3',
      thumbnail: '/api/placeholder/600/400',
      featured: false,
      views: 2567,
      likes: 189,
      downloads: 123,
      tags: ['evangelism', 'missions', 'discipleship', 'nigeria'],
      notes: '/sermons/notes/great-commission.pdf',
      transcript: '/sermons/transcripts/great-commission.txt'
    }
  ];

  /**
   * Initialize sermons data
   */
  useEffect(() => {
    const initializeSermons = () => {
      try {
        setLoading(true);
        
        // In real app, this would be an API call
        setTimeout(() => {
          setSermons(mockSermons);
          setFilteredSermons(mockSermons);
          setFeaturedSermon(mockSermons.find(sermon => sermon.featured));
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load sermons. Please try again later.');
        setLoading(false);
      }
    };

    initializeSermons();
  }, []);

  /**
   * Filter sermons based on active filters and search term
   */
  useEffect(() => {
    let filtered = [...sermons];

    // Apply series filter
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(sermon => sermon.series === selectedSeries);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sermon =>
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.pastor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (activeFilter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'series':
        filtered.sort((a, b) => a.seriesTitle.localeCompare(b.seriesTitle));
        break;
      case 'pastor':
        filtered.sort((a, b) => a.pastor.localeCompare(b.pastor));
        break;
      default:
        break;
    }

    setFilteredSermons(filtered);
    setCurrentPage(1);
  }, [activeFilter, searchTerm, selectedSeries, sermons]);

  /**
   * Handle audio playback
   */
  const handlePlayAudio = (sermon) => {
    if (currentlyPlaying === sermon.id) {
      // Pause current audio
      if (audioPlayer) {
        audioPlayer.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Play new audio
      if (audioPlayer) {
        audioPlayer.pause();
      }
      
      const newPlayer = new Audio(sermon.audioUrl);
      newPlayer.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      newPlayer.play();
      setAudioPlayer(newPlayer);
      setCurrentlyPlaying(sermon.id);
    }
  };

  /**
   * Handle sermon sharing
   */
  const handleShare = async (sermon) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: `Listen to "${sermon.title}" by ${sermon.pastor}`,
          url: window.location.href + `#sermon-${sermon.id}`
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href + `#sermon-${sermon.id}`);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href + `#sermon-${sermon.id}`);
      alert('Link copied to clipboard!');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format duration for display
   */
  const formatDuration = (duration) => {
    const [minutes, seconds] = duration.split(':');
    return `${minutes}m ${seconds}s`;
  };

  // Pagination calculations
  const indexOfLastSermon = currentPage * sermonsPerPage;
  const indexOfFirstSermon = indexOfLastSermon - sermonsPerPage;
  const currentSermons = filteredSermons.slice(indexOfFirstSermon, indexOfLastSermon);
  const totalPages = Math.ceil(filteredSermons.length / sermonsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Sermons - Haven Word Church"
          description="Listen to inspiring sermons and biblical teachings from Haven Word Church pastors in Ibadan."
          keywords="church sermons, biblical teachings, Pastor Emmanuel Adebayo, Haven Word Church, Ibadan sermons"
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
          title="Sermons - Haven Word Church"
          description="Listen to inspiring sermons and biblical teachings from Haven Word Church pastors in Ibadan."
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Sermons</h2>
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
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Sermons - Haven Word Church"
        description="Listen to inspiring sermons and biblical teachings from Pastor Emmanuel Adebayo and other ministers at Haven Word Church, Ibadan. Audio and video sermons available."
        keywords="church sermons, biblical teachings, Pastor Emmanuel Adebayo, Pastor David Okafor, Haven Word Church, Ibadan sermons, audio sermons, video sermons"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-800 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sermon Library
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Be encouraged and equipped through God's Word with messages that inspire, challenge, and transform
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-purple-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <span>Audio Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                <span>Video Sermons</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Free Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sermon */}
      {featuredSermon && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Featured Message
            </h2>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {featuredSermon.seriesTitle}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {featuredSermon.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{featuredSermon.pastor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(featuredSermon.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatDuration(featuredSermon.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    {featuredSermon.description}
                  </p>
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      {featuredSermon.scripture}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handlePlayAudio(featuredSermon)}
                      className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      {currentlyPlaying === featuredSermon.id ? 'Playing...' : 'Listen Now'}
                    </button>
                    <button className="flex items-center gap-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-colors">
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(featuredSermon)}
                      className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={featuredSermon.thumbnail}
                    alt={featuredSermon.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handlePlayAudio(featuredSermon)}
                      className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-purple-600 hover:bg-opacity-100 transition-all"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sermons, pastors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    activeFilter === option.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Series Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <label className="text-sm font-medium text-gray-700 mr-2">Series:</label>
            {sermonSeries.slice(0, 6).map((series) => (
              <button
                key={series.key}
                onClick={() => setSelectedSeries(series.key)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedSeries === series.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {series.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Showing {currentSermons.length} of {filteredSermons.length} sermons
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Sermons Grid */}
          {currentSermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentSermons.map((sermon) => (
                <SermonCard
                  key={sermon.id}
                  sermon={sermon}
                  onPlay={() => handlePlayAudio(sermon)}
                  onShare={() => handleShare(sermon)}
                  isPlaying={currentlyPlaying === sermon.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Sermons Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No sermons match your search for "${searchTerm}"`
                  : 'No sermons available for the selected filters'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
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
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === index + 1
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss a Message
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our podcast or follow us to get the latest sermons delivered directly to your device.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Subscribe to Podcast
            </button>
            <button className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-colors">
              Download App
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-gray-500">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Available on Spotify
            </span>
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Apple Podcasts
            </span>
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Google Podcasts
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sermons;