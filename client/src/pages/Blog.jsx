import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Tag, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BlogCard from '../components/cards/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/ui/Button';

/**
 * Blog Page Component
 * Displays church blog posts with filtering, search, and pagination
 * Features categories, tags, search functionality, and responsive design
 */
const Blog = () => {
  const { user } = useAuth();
  // State management
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const postsPerPage = 9;

  const categories = ['all', 'Faith', 'Family', 'Prayer', 'Ministry', 'Grace', 'Youth'];
  const allTags = ['faith', 'biblical-characters', 'trust', 'family', 'parenting', 'marriage', 'prayer', 'spiritual-growth', 'hope', 'ministry', 'calling', 'service', 'grace', 'daily-life', 'transformation', 'youth', 'leadership', 'next-generation'];

  /**
   * Filter posts based on search term, category, and tags
   */
  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts when search/filter criteria change
  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory, selectedTag, filterPosts]);

  /**
   * Fetch blog posts from API
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Uncomment when API is ready
      // const response = await blogService.getPosts();
      // setPosts(response.data);
      setPosts([]);
      setLoading(false);
    } catch (err) {
      setError('Failed to load blog posts. Please try again later.');
      setLoading(false);
    }
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  /**
   * Handle tag filter change
   */
  const handleTagChange = (tag) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('');
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchPosts}
            variant="primary"
            size="md"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const featuredPosts = posts.filter(post => post.featured);

  return (
    <>
      <Helmet>
        <title>Blog - Haven Word Church</title>
        <meta 
          name="description" 
          content="Read inspiring articles, spiritual insights, and practical wisdom from Haven Word Church. Explore faith, family, ministry, and Christian living in Nigeria." 
        />
        <meta name="keywords" content="Christian blog, faith articles, spiritual growth, Nigerian church, biblical wisdom" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 pt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Church Blog
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Inspiring articles, spiritual insights, and practical wisdom for your faith journey
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Articles</h2>
                <div className="w-20 h-1 bg-blue-600"></div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.slice(0, 3).map((post) => (
                  <BlogCard
                    key={post._id}
                    post={post}
                    featured={true}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filters Section */}
        <section className="py-8 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Categories:</span>
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    variant={selectedCategory === category ? 'primary' : 'outline'}
                    size="sm"
                    className="rounded-full text-sm font-medium"
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>

              {/* Filter Toggle & Clear */}
              <div className="flex items-center gap-4">
                {/* Create Blog Button - Only show for authenticated users */}
                {user && (
                  <Link to="/blog/create">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Blog
                    </Button>
                  </Link>
                )}
                
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 lg:hidden"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                
                {(searchTerm || selectedCategory !== 'all' || selectedTag) && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Clear Filters
                  </Button>
                )}
                
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Tag Filters */}
            <div className={`mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    variant={selectedTag === tag ? 'primary' : 'outline'}
                    size="sm"
                    className="rounded-full text-sm flex items-center gap-1 border"
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {currentPosts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {currentPosts.map((post) => (
                    <BlogCard
                      key={post._id}
                      post={post}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <Button
                        key={number}
                        onClick={() => paginate(number)}
                        variant={currentPage === number ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {number}
                      </Button>
                    ))}
                    
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try adjusting your search terms or filters to find what you&apos;re looking for.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="primary"
                    size="md"
                    className="mt-6"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
              <p className="text-xl mb-8 opacity-90">
                Subscribe to receive our latest articles and spiritual insights directly in your inbox.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="font-semibold whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </form>
              
              <p className="text-sm opacity-75 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;