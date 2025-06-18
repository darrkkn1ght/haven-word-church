import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Download, Share2, Calendar, Clock, User, BookOpen, Search, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SermonCard from '../components/cards/SermonCard';

/**
 * Sermons Page Component
 * Displays sermon library with audio/video playback, filtering, search, and sharing functionality
 * Includes Nigerian church context and local pastor information
 */
const Sermons = () => {
  // State management
  const [sermons, setSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [loading, setLoading] = useState(false);
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

  /**
   * Initialize sermons data (mock data for working demo)
   */
  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      try {
        // Fetch Telegram sermons
        const telegramRes = await axios.get('/api/sermons/telegram');
        const telegramSermons = (telegramRes.data?.sermons || []).map((sermon, idx) => ({
          id: `telegram-${sermon.message_id || idx}`,
          title: sermon.caption || sermon.title || 'Telegram Audio Sermon',
          description: 'Audio sermon from our official Telegram channel.',
          pastor: sermon.performer || 'Pastor Anthonia Amadi',
          date: sermon.date || new Date().toISOString(),
          duration: sermon.duration ? `${Math.floor(sermon.duration / 60)}:${('0' + (sermon.duration % 60)).slice(-2)}` : '00:00',
          series: 'telegram',
          seriesTitle: 'Telegram Channel',
          scripture: '',
          audioUrl: sermon.audioUrl,
          videoUrl: '',
          thumbnail: '/logo512.png',
          featured: false,
          views: 0,
          likes: 0,
          downloads: 0,
          tags: ['telegram'],
          notes: '',
          transcript: '',
          telegramLink: sermon.telegramLink
        }));
        setSermons(telegramSermons);
        setFilteredSermons(telegramSermons);
        setFeaturedSermon(telegramSermons.find(sermon => sermon.featured));
      } catch (err) {
        setSermons([]);
        setFilteredSermons([]);
        setFeaturedSermon(null);
      }
      setLoading(false);
    };
    fetchSermons();
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

  // Telegram badge component

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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

  if (!loading && sermons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <SEOHead 
          title="Sermons - Haven Word Church"
          description="Listen to inspiring sermons and biblical teachings from Haven Word Church pastors in Ibadan."
          keywords="church sermons, biblical teachings, Pastor Emmanuel Adebayo, Haven Word Church, Ibadan sermons"
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Sermons</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Our Telegram sermon library is coming soon!</p>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">Coming Soon</span>
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
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Featured Message
            </h2>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {featuredSermon.seriesTitle}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {featuredSermon.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
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
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {featuredSermon.description}
                  </p>
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
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
                    <button className="flex items-center gap-2 border border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-300 px-6 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white dark:hover:bg-purple-800 dark:hover:text-white transition-colors">
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(featuredSermon)}
                      className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
      <section className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Sort by:</label>
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    activeFilter === option.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Series Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Series:</label>
            {sermonSeries.slice(0, 6).map((series) => (
              <button
                key={series.key}
                onClick={() => setSelectedSeries(series.key)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedSeries === series.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
            <p className="text-gray-600 dark:text-gray-300">
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
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                No Sermons Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? `No sermons match your search for "${searchTerm}"`
                  : 'No sermons available for the selected filters'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
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
                      ? 'bg-purple-600 text-white'
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
      <section className="bg-purple-50 dark:bg-purple-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Never Miss a Message
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our podcast or follow us to get the latest sermons delivered directly to your device.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Subscribe to Podcast
            </button>
            <button className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-colors dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-800 dark:hover:text-white">
              Download App
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-gray-500 dark:text-gray-300">
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