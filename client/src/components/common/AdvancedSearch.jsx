import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Calendar,
  Tag,
  User,
  BookOpen,
  Music,
  Users,
  Download,
  Clear,
} from 'lucide-react';
import Button from '../ui/Button';
import useContentSearch from '../../hooks/useContentSearch';

/**
 * AdvancedSearch Component
 * 
 * Comprehensive search interface with advanced filtering, suggestions, and history
 * Provides a modern, accessible search experience for all content types
 * 
 * @param {Object} props - Component props
 * @param {string} props.contentType - Type of content (blog, sermon, event, etc.)
 * @param {Function} props.onSearch - Callback when search is performed
 * @param {Function} props.onResultSelect - Callback when result is selected
 * @param {Object} props.options - Search options
 */
const AdvancedSearch = ({
  contentType,
  onSearch,
  onResultSelect,
  options = {}
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [setShowSuggestions] = useState(false);

  // Search hook
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    recentSearches,
    handleSearchChange,
    performSearch,
    updateFilters,
    clearFilters,
    clearSearchHistory,
    removeFromHistory,
    getFilterOptions,
    getSearchStats,
    exportSearchResults,
    minSearchLength,
    enableHistory
  } = useContentSearch(contentType, options);

  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Get filter options for this content type
  const filterOptions = getFilterOptions();
  const stats = getSearchStats();

  /**
   * Handle search input change
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearchChange(value);
    setShowSuggestions(value.length >= minSearchLength);
    setShowHistory(false);
  };

  /**
   * Handle search submission
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery && searchQuery.length >= minSearchLength) {
      performSearch(searchQuery, {}); // Clear filters for new search
      setShowSuggestions(false);
      setShowHistory(false);
      if (onSearch) {
        onSearch(searchQuery, {});
      }
    }
  };

  /**
   * Handle history item selection
   */
  const handleHistorySelect = (historyItem) => {
    handleSearchChange(historyItem.query);
    updateFilters(historyItem.filters);
    setShowHistory(false);
    performSearch(historyItem.query, historyItem.filters);
    if (onSearch) {
      onSearch(historyItem.query, historyItem.filters);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterKey, value) => {
    updateFilters({ [filterKey]: value });
  };

  /**
   * Clear search
   */
  const handleClearSearch = () => {
    handleSearchChange('');
    clearFilters();
    setShowSuggestions(false);
    setShowHistory(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get content type icon
   */
  const getContentTypeIcon = () => {
    const icons = {
      blog: BookOpen,
      sermon: Music,
      event: Calendar,
      ministry: Users
    };
    return icons[contentType] || Search;
  };

  const ContentTypeIcon = getContentTypeIcon();

  /**
   * Handle click outside to close dropdowns
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchQuery.length >= minSearchLength) {
                  setShowSuggestions(true);
                } else if (enableHistory && recentSearches.length > 0) {
                  setShowHistory(true);
                }
              }}
              placeholder={`Search ${contentType}...`}
              className="w-full pl-12 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Search Button */}
            <button
              type="submit"
              disabled={!searchQuery || searchQuery.length < minSearchLength || isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Stats */}
          {searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Found {stats.totalResults} results in {stats.searchTime}ms
            </div>
          )}

          {/* Search Error */}
          {searchError && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {searchError}
            </div>
          )}
        </div>
      </form>

      {/* Search Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>

          {/* History Toggle */}
          {enableHistory && false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 hover:text-gray-800"
            >
              {/* <History className="w-4 h-4 mr-1" /> */}
              History
            </Button>
          )}

          {/* Export Results */}
          {searchResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportSearchResults()}
              className="text-gray-600 hover:text-gray-800"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>

        {/* Clear All */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClearSearch();
              clearFilters();
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            <Clear className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            {filterOptions.categories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            {filterOptions.dateRanges && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  value={''}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Time</option>
                  {filterOptions.dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Language Filter (for blogs) */}
            {filterOptions.languages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={''}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Languages</option>
                  {filterOptions.languages.map((language) => (
                    <option key={language} value={language}>
                      {language.charAt(0).toUpperCase() + language.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Featured Filter */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured Only
                </span>
              </label>
            </div>

            {/* Has Media Filter (for sermons) */}
            {contentType === 'sermon' && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={(e) => handleFilterChange('hasMedia', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Has Media
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search History */}
      {showHistory && recentSearches.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
        >
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Recent Searches
              </div>
              <button
                onClick={clearSearchHistory}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            {recentSearches.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <button
                  onClick={() => handleHistorySelect(item)}
                  className="flex-1 text-left text-sm flex items-center"
                >
                  <Clock className="w-3 h-3 mr-2 text-gray-400" />
                  <span className="flex-1">{item.query}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.timestamp)}
                  </span>
                </button>
                <button
                  onClick={() => removeFromHistory(item.query)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stats.totalResults} results
            </div>
          </div>
          
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div
                key={result.id || index}
                onClick={() => onResultSelect && onResultSelect(result)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <ContentTypeIcon className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.excerpt || result.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {result.author && (
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {result.author}
                        </span>
                      )}
                      {result.date && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(result.date)}
                        </span>
                      )}
                      {result.category && (
                        <span className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AdvancedSearch.propTypes = {
  contentType: PropTypes.string.isRequired,
  onSearch: PropTypes.func,
  onResultSelect: PropTypes.func,
  options: PropTypes.object
};

export default AdvancedSearch; 