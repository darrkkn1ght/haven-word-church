import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, truncateText } from '../../utils/helpers';

/**
 * BlogCard Component
 * 
 * Displays blog post information in a card format with image, title, 
 * excerpt, author, date, and category. Optimized for Nigerian church context.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.post - Blog post object
 * @param {string} props.post.id - Unique post identifier
 * @param {string} props.post.title - Post title
 * @param {string} props.post.excerpt - Post excerpt/summary
 * @param {string} props.post.content - Full post content
 * @param {string} props.post.author - Post author name
 * @param {string} props.post.authorImage - Author profile image URL
 * @param {string} props.post.category - Post category
 * @param {string} props.post.featuredImage - Post featured image URL
 * @param {string|Date} props.post.publishedAt - Publication date
 * @param {number} props.post.readTime - Estimated read time in minutes
 * @param {string[]} props.post.tags - Post tags array
 * @param {boolean} props.post.featured - Whether post is featured
 * @param {string} [props.variant='default'] - Card variant style
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler function
 * @param {boolean} [props.showAuthor=true] - Whether to show author info
 * @param {boolean} [props.showCategory=true] - Whether to show category
 * @param {boolean} [props.showReadTime=true] - Whether to show read time
 * @param {boolean} [props.showTags=false] - Whether to show tags
 * @param {number} [props.excerptLength=150] - Maximum excerpt length
 * @returns {JSX.Element} BlogCard component
 * 
 * @example
 * const post = {
 *   id: '1',
 *   title: 'Walking in Faith',
 *   excerpt: 'Discover the power of faith in daily life...',
 *   author: 'Pastor John Adebayo',
 *   category: 'Spiritual Growth',
 *   featuredImage: '/images/faith-walk.jpg',
 *   publishedAt: '2024-01-15',
 *   readTime: 5
 * };
 * 
 * <BlogCard 
 *   post={post}
 *   onClick={() => navigate(`/blog/${post.id}`)}
 * />
 */
const BlogCard = ({
  post,
  variant = 'default',
  className = '',
  onClick,
  showAuthor = true,
  showCategory = true,
  showReadTime = true,
  showTags = false,
  excerptLength = 150
}) => {
  // Destructure post properties with defaults
  const {
    title = 'Untitled Post',
    excerpt = '',
    content = '',
    author = 'Haven Word Church',
    authorImage,
    category = 'General',
    featuredImage,
    publishedAt,
    readTime = 3,
    tags = [],
    featured = false
  } = post || {};

  // Determine card classes based on variant
  const getCardClasses = () => {
    const baseClasses = 'group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary-200';
    
    const variantClasses = {
      default: 'cursor-pointer',
      compact: 'cursor-pointer',
      featured: 'cursor-pointer ring-2 ring-primary-100',
      minimal: 'cursor-pointer shadow-none border-0 hover:shadow-sm'
    };

    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`;
  };

  // Handle card click
  const handleClick = (e) => {
    if (onClick && typeof onClick === 'function') {
      onClick(e, post);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(e, post);
    }
  };

  // Get display excerpt
  const displayExcerpt = excerpt || (content ? truncateText(content, excerptLength) : '');

  // Format category for display
  const formatCategory = (cat) => {
    return cat?.replace(/([A-Z])/g, ' $1').trim() || 'General';
  };

  // Get category color classes
  const getCategoryColor = (category) => {
    const colors = {
      'Spiritual Growth': 'bg-green-100 text-green-800',
      'Prayer': 'bg-blue-100 text-blue-800',
      'Bible Study': 'bg-purple-100 text-purple-800',
      'Youth': 'bg-orange-100 text-orange-800',
      'Family': 'bg-pink-100 text-pink-800',
      'Testimony': 'bg-yellow-100 text-yellow-800',
      'Community': 'bg-indigo-100 text-indigo-800',
      'Worship': 'bg-red-100 text-red-800',
      'Missions': 'bg-teal-100 text-teal-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <article
      className={getCardClasses()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'article'}
      aria-label={`Blog post: ${title}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            Featured
          </span>
        </div>
      )}

      {/* Featured Image */}
      {featuredImage && (
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={featuredImage}
            alt={`Featured image for ${title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback for broken images */}
          <div className="absolute inset-0 bg-gray-100 items-center justify-center hidden">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {/* Category & Read Time */}
        <div className="flex items-center justify-between mb-3">
          {showCategory && category && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
              {formatCategory(category)}
            </span>
          )}
          {showReadTime && readTime && (
            <span className="text-xs text-gray-500 flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {readTime} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        {displayExcerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {displayExcerpt}
          </p>
        )}

        {/* Tags */}
        {showTags && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {showAuthor && author && (
            <div className="flex items-center">
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={`${author} profile`}
                  className="w-8 h-8 rounded-full mr-3"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-primary-600">
                    {typeof author === 'string' && author.length > 0
                      ? author.charAt(0).toUpperCase()
                      : (author && typeof author.name === 'string' && author.name.length > 0
                        ? author.name.charAt(0).toUpperCase()
                        : 'H')}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{typeof author === 'string' ? author : (author && typeof author.name === 'string' ? author.name : 'Haven Word Church')}</p>
              </div>
            </div>
          )}

          {publishedAt && (
            <time
              dateTime={publishedAt}
              className="text-xs text-gray-500"
            >
              {formatDate(publishedAt)}
            </time>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
};

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    author: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
      })
    ]),
    authorImage: PropTypes.string,
    category: PropTypes.string,
    featuredImage: PropTypes.string,
    publishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    readTime: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    featured: PropTypes.bool,
  }).isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  showAuthor: PropTypes.bool,
  showCategory: PropTypes.bool,
  showReadTime: PropTypes.bool,
  showTags: PropTypes.bool,
  excerptLength: PropTypes.number,
};

export default BlogCard;