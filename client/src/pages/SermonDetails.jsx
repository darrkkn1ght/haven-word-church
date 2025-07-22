import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Play, 
  Download, 
  Share2,
  ArrowLeft,
  BookOpen,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import SocialShare from '../components/common/SocialShare';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/common/SEOHead';
import { getSermonById } from '../services/api';

const SermonDetails = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermon', id],
    queryFn: () => getSermonById(id),
    enabled: !!id
  });

  useEffect(() => {
    if (sermon) {
      // Update page title and meta tags for SEO
      document.title = `${sermon.title} - Haven Word Church`;
      
      // Add meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', sermon.description || sermon.title);
      }
    }
  }, [sermon]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Audio player logic would go here
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (sermon?.audioUrl) {
      const link = document.createElement('a');
      link.href = sermon.audioUrl;
      link.download = `${sermon.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-8">Error loading sermon</div>;
  if (!sermon) return <div className="text-center py-8">Sermon not found</div>;

  const shareData = {
    title: sermon.title,
    description: sermon.description || `Listen to "${sermon.title}" by ${sermon.speaker} at Haven Word Church`,
    url: window.location.href,
    image: sermon.image || '/logo.jpeg',
    hashtags: ['HavenWordChurch', 'Sermon', 'Faith', 'Church']
  };

  return (
    <>
      <SEOHead
        title={`${sermon.title} - Haven Word Church`}
        description={sermon.description || `Listen to "${sermon.title}" by ${sermon.speaker} at Haven Word Church`}
        keywords={['sermon', 'preaching', 'church', 'faith', sermon.speaker, ...(sermon.tags || [])]}
        image={sermon.image}
        url={`/sermons/${id}`}
        type="article"
        author={sermon.speaker}
        publishedTime={sermon.date}
        section="Sermons"
        tags={sermon.tags || []}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link 
            to="/sermons" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sermons
          </Link>

          {/* Sermon Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
              {sermon.image && (
                <img 
                  src={sermon.image} 
                  alt={sermon.title}
                  className="w-full h-full object-cover opacity-20"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{sermon.title}</h1>
                  <p className="text-xl opacity-90">by {sermon.speaker}</p>
                </div>
              </div>
            </div>

            {/* Sermon Info */}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(sermon.date), 'MMMM d, yyyy')}</span>
                </div>
                {sermon.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{sermon.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{sermon.views || 0} views</span>
                </div>
              </div>

              {/* Scripture Reference */}
              {sermon.scripture && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Scripture Reference:</h3>
                  <p className="text-blue-700 dark:text-blue-300 italic">"{sermon.scripture}"</p>
                </div>
              )}

              {/* Description */}
              {sermon.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description:</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {sermon.description}
                  </p>
                </div>
              )}

              {/* Audio Player */}
              {sermon.audioUrl && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <div className="w-4 h-4 border-2 border-white border-l-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 ml-1" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <audio
                    src={sermon.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      <Heart className="w-4 h-4" />
                      Like
                    </button>
                  </div>
                </div>
              )}

              {/* Social Share */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share This Sermon
                </h3>
                <SocialShare {...shareData} />
              </div>
            </div>
          </div>

          {/* Related Sermons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Related Sermons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Related sermons would be populated here */}
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Related sermons will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SermonDetails;
