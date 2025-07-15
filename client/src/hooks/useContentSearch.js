import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { storageService } from '../services/storageService';

/**
 * useContentSearch Hook
 * 
 * Comprehensive content search functionality
 * Supports advanced filtering, search suggestions, and search history
 * 
 * @param {string} contentType - Type of content (blog, sermon, event, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} Search management functions and state
 */
export const useContentSearch = (contentType, options = {}) => {
  const {
    enableSuggestions = true,
    enableHistory = true,
    enableFilters = true,
    maxHistoryItems = 10,
    debounceDelay = 300,
    minSearchLength = 2
  } = options;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchStats, setSearchStats] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);

  // Refs
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Storage keys
  const historyKey = `search_history_${contentType}`;
  const suggestionsKey = `search_suggestions_${contentType}`;

  // Default filters for different content types
  const defaultFilters = {
    blog: {
      category: '',
      author: '',
      dateRange: '',
      tags: [],
      featured: false,
      language: '',
      status: 'published'
    },
    sermon: {
      category: '',
      speaker: '',
      series: '',
      serviceType: '',
      dateRange: '',
      hasMedia: false,
      featured: false
    },
    event: {
      category: '',
      type: '',
      dateRange: '',
      location: '',
      featured: false,
      status: 'published'
    },
    ministry: {
      category: '',
      type: '',
      status: 'active',
      featured: false
    }
  };

  // Search suggestions for different content types
  const searchSuggestions = {
    blog: [
      'faith', 'prayer', 'bible study', 'testimony', 'devotional', 'church news',
      'family', 'marriage', 'youth', 'children', 'ministry', 'outreach',
      'grace', 'love', 'hope', 'forgiveness', 'salvation', 'discipleship'
    ],
    sermon: [
      'gospel', 'salvation', 'faith', 'grace', 'prayer', 'worship',
      'bible study', 'prophecy', 'healing', 'deliverance', 'blessing',
      'kingdom', 'holiness', 'obedience', 'love', 'forgiveness'
    ],
    event: [
      'service', 'prayer meeting', 'bible study', 'youth program',
      'children program', 'fellowship', 'conference', 'seminar',
      'outreach', 'community service', 'wedding', 'dedication'
    ],
    ministry: [
      'worship', 'youth', 'children', 'men', 'women', 'outreach',
      'discipleship', 'prayer', 'music', 'media', 'hospitality'
    ]
  };

  /**
   * Load search history and suggestions
   */
  const loadSearchData = useCallback(() => {
    try {
      if (enableHistory) {
        const history = storageService.getLocal(historyKey) || [];
        setSearchHistory(history);
        setRecentSearches(history.slice(0, 5));
      }

      if (enableSuggestions) {
        const suggestions = storageService.getLocal(suggestionsKey) || searchSuggestions[contentType] || [];
        setSearchSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  }, [contentType, enableHistory, enableSuggestions, historyKey, suggestionsKey]);

  /**
   * Save search to history
   */
  const saveToHistory = useCallback((query) => {
    if (!enableHistory || !query.trim()) return;

    try {
      const trimmedQuery = query.trim();
      const history = storageService.getLocal(historyKey) || [];
      
      // Remove existing occurrence
      const filtered = history.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Add to beginning with timestamp
      const newEntry = {
        query: trimmedQuery,
        timestamp: new Date().toISOString(),
        contentType,
        filters: activeFilters
      };
      
      const updated = [newEntry, ...filtered].slice(0, maxHistoryItems);
      storageService.setLocal(historyKey, updated);
      
      setSearchHistory(updated);
      setRecentSearches(updated.slice(0, 5));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [enableHistory, historyKey, contentType, activeFilters, maxHistoryItems]);

  /**
   * Clear search history
   */
  const clearSearchHistory = useCallback(() => {
    try {
      storageService.removeLocal(historyKey);
      setSearchHistory([]);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, [historyKey]);

  /**
   * Remove item from search history
   */
  const removeFromHistory = useCallback((query) => {
    try {
      const history = storageService.getLocal(historyKey) || [];
      const filtered = history.filter(item => item.query !== query);
      storageService.setLocal(historyKey, filtered);
      
      setSearchHistory(filtered);
      setRecentSearches(filtered.slice(0, 5));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }, [historyKey]);

  /**
   * Get search suggestions based on query
   */
  const getSuggestions = useCallback((query) => {
    if (!enableSuggestions || !query || query.length < minSearchLength) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();
    const suggestions = searchSuggestions[contentType] || [];
    
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [enableSuggestions, minSearchLength, searchSuggestions, contentType]);

  /**
   * Perform search with API call
   */
  const performSearch = useCallback(async (query, filters = {}) => {
    if (!query || query.length < minSearchLength) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Build search parameters
      const searchParams = new URLSearchParams({
        q: query,
        contentType,
        ...filters
      });

      // Make API call
      const response = await fetch(`/api/search?${searchParams}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.results || []);
        setSearchStats(data.data.stats || {});
        
        // Save to history
        saveToHistory(query);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      
      console.error('Search error:', error);
      setSearchError(error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [contentType, minSearchLength, saveToHistory]);

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback(
    debounce((query, filters) => {
      performSearch(query, filters);
    }, debounceDelay),
    [performSearch, debounceDelay]
  );

  /**
   * Handle search query change
   */
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    
    if (query && query.length >= minSearchLength) {
      // Get suggestions
      const suggestions = getSuggestions(query);
      setSearchSuggestions(suggestions);
      
      // Perform search
      debouncedSearch(query, activeFilters);
    } else {
      setSearchResults([]);
      setSearchSuggestions([]);
    }
  }, [minSearchLength, getSuggestions, debouncedSearch, activeFilters]);

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...activeFilters, ...newFilters };
    setActiveFilters(updatedFilters);
    
    if (searchQuery && searchQuery.length >= minSearchLength) {
      performSearch(searchQuery, updatedFilters);
    }
  }, [activeFilters, searchQuery, minSearchLength, performSearch]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setActiveFilters(defaultFilters[contentType] || {});
    
    if (searchQuery && searchQuery.length >= minSearchLength) {
      performSearch(searchQuery, defaultFilters[contentType] || {});
    }
  }, [contentType, searchQuery, minSearchLength, performSearch]);

  /**
   * Get filter options for content type
   */
  const getFilterOptions = useCallback(() => {
    const options = {
      blog: {
        categories: [
          'sermon-notes', 'testimony', 'announcement', 'devotional',
          'church-news', 'community-outreach', 'youth-ministry',
          'women-ministry', 'men-ministry', 'children-ministry',
          'prayer-request', 'missions', 'bible-study', 'fellowship'
        ],
        languages: ['english', 'yoruba', 'igbo', 'hausa', 'pidgin'],
        dateRanges: [
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' },
          { value: 'custom', label: 'Custom Range' }
        ]
      },
      sermon: {
        categories: [
          'teaching', 'evangelistic', 'prophetic', 'pastoral',
          'worship', 'prayer', 'testimony', 'special-occasion'
        ],
        serviceTypes: [
          'Sunday Service', 'Midweek Service', 'Prayer Meeting',
          'Youth Service', 'Women Fellowship', 'Men Fellowship',
          'Special Service', 'Conference', 'Retreat'
        ],
        dateRanges: [
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' },
          { value: 'custom', label: 'Custom Range' }
        ]
      },
      event: {
        categories: [
          'Service', 'Prayer Meeting', 'Bible Study', 'Youth Program',
          'Children Program', 'Men Fellowship', 'Women Fellowship',
          'Conference', 'Seminar', 'Workshop', 'Outreach',
          'Community Service', 'Wedding', 'Dedication'
        ],
        types: ['Regular', 'Special', 'One-time', 'Recurring'],
        dateRanges: [
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' },
          { value: 'custom', label: 'Custom Range' }
        ]
      },
      ministry: {
        categories: [
          'worship', 'children', 'youth', 'men', 'women',
          'outreach', 'discipleship', 'service', 'administration',
          'special', 'fellowship', 'prayer', 'music', 'media'
        ],
        types: ['department', 'ministry', 'group', 'committee', 'team']
      }
    };

    return options[contentType] || {};
  }, [contentType]);

  /**
   * Get search statistics
   */
  const getSearchStats = useCallback(() => {
    return {
      totalResults: searchResults.length,
      searchTime: searchStats.searchTime || 0,
      totalAvailable: searchStats.totalAvailable || 0,
      filters: Object.keys(activeFilters).filter(key => activeFilters[key]),
      historyCount: searchHistory.length,
      recentCount: recentSearches.length
    };
  }, [searchResults, searchStats, activeFilters, searchHistory, recentSearches]);

  /**
   * Export search results
   */
  const exportSearchResults = useCallback((format = 'json') => {
    const data = {
      query: searchQuery,
      filters: activeFilters,
      results: searchResults,
      stats: searchStats,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search_results_${contentType}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [searchQuery, activeFilters, searchResults, searchStats, contentType]);

  // Initialize on mount
  useEffect(() => {
    loadSearchData();
    setActiveFilters(defaultFilters[contentType] || {});
  }, [loadSearchData, contentType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    searchHistory,
    searchSuggestions,
    activeFilters,
    searchStats,
    recentSearches,

    // Core functions
    handleSearchChange,
    performSearch,
    updateFilters,
    clearFilters,

    // History management
    saveToHistory,
    clearSearchHistory,
    removeFromHistory,

    // Utility functions
    getSuggestions,
    getFilterOptions,
    getSearchStats,
    exportSearchResults,

    // Configuration
    minSearchLength,
    enableSuggestions,
    enableHistory,
    enableFilters
  };
};

export default useContentSearch; 