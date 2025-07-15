import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Share2,
  ArrowLeft,
  Tag,
  Heart,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import SocialShare from '../components/common/SocialShare';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/common/SEOHead';
import { getBlogPostById } from '../services/api';

const BlogPost = () => {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blogPost', id],
    queryFn: () => getBlogPostById(id),
    enabled: !!id
  });

  useEffect(() => {
    if (post) {
      // Update page title and meta tags for SEO
      document.title = `${post.title} - Haven Word Church Blog`;
      
      // Add meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt || post.title);
      }

      // Add Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', post.title);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', post.excerpt || post.title);
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && post.image) {
        ogImage.setAttribute('content', post.image);
      }

      setLikesCount(post.likes || 0);
    }
  }, [post]);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    // API call to update likes would go here
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-8">Error loading blog post</div>;
  if (!post) return <div className="text-center py-8">Blog post not found</div>;

  const shareData = {
    title: post.title,
    description: post.excerpt || post.title,
    url: window.location.href,
    image: post.image || '/logo.jpeg',
    hashtags: ['HavenWordChurch', 'Blog', 'Faith', 'Church', ...(post.tags || [])]
  };

  return (
    <>
      <SEOHead
        title={`${post.title} - Haven Word Church Blog`}
        description={post.excerpt || post.title}
        keywords={['blog', 'church', 'faith', 'christian', post.author, ...(post.tags || [])]}
        image={post.image}
        url={`/blog/${id}`}
        type="article"
        author={post.author}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        section="Blog"
        tags={post.tags || []}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Blog Post Header */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Featured Image */}
            {post.image && (
              <div className="relative h-64 md:h-96">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20" />
              </div>
            )}

            {/* Post Content */}
            <div className="p-6 md:p-8">
              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views || 0} views</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {post.excerpt}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>

              {/* Social Share */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share This Post
                </h3>
                <SocialShare {...shareData} />
              </div>
            </div>
          </article>

          {/* Author Bio */}
          {post.authorBio && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Author</h2>
              <div className="flex items-start gap-4">
                {post.authorImage && (
                  <img 
                    src={post.authorImage} 
                    alt={post.author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{post.author}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{post.authorBio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Related posts would be populated here */}
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Related posts will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
