import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

/**
 * useContentCategories Hook
 * 
 * Comprehensive content categorization and tagging management
 * Supports category hierarchy, tag suggestions, and content organization
 * 
 * @param {string} contentType - Type of content (blog, sermon, event, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} Category management functions and state
 */
export const useContentCategories = (contentType, options = {}) => {
  const {
    enableAutoSuggestions = true,
    maxTagsPerContent = 20,
    enableCategoryHierarchy = true,
    enableTagAnalytics = true
  } = options;

  // State
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState({});
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [tagStats, setTagStats] = useState({});

  // Storage keys
  const categoriesKey = `categories_${contentType}`;
  const tagsKey = `tags_${contentType}`;
  const hierarchyKey = `hierarchy_${contentType}`;
  const analyticsKey = `analytics_${contentType}`;

  // Default categories for different content types
  const defaultCategories = {
    blog: [
      { id: 'sermon-notes', name: 'Sermon Notes', description: 'Notes and insights from sermons', color: '#3B82F6', icon: '📖' },
      { id: 'testimony', name: 'Testimonies', description: 'Personal testimonies and stories', color: '#10B981', icon: '🙏' },
      { id: 'announcement', name: 'Announcements', description: 'Church announcements and updates', color: '#F59E0B', icon: '📢' },
      { id: 'devotional', name: 'Devotionals', description: 'Daily devotionals and reflections', color: '#8B5CF6', icon: '💝' },
      { id: 'church-news', name: 'Church News', description: 'News and updates from the church', color: '#EF4444', icon: '📰' },
      { id: 'community-outreach', name: 'Community Outreach', description: 'Outreach and community service', color: '#06B6D4', icon: '🤝' },
      { id: 'youth-ministry', name: 'Youth Ministry', description: 'Youth-related content and activities', color: '#84CC16', icon: '👥' },
      { id: 'women-ministry', name: 'Women Ministry', description: 'Women-focused content and ministry', color: '#EC4899', icon: '👩' },
      { id: 'men-ministry', name: 'Men Ministry', description: 'Men-focused content and ministry', color: '#6366F1', icon: '👨' },
      { id: 'children-ministry', name: 'Children Ministry', description: 'Children and family content', color: '#F97316', icon: '👶' },
      { id: 'prayer-request', name: 'Prayer Requests', description: 'Prayer requests and intercession', color: '#A855F7', icon: '🙏' },
      { id: 'missions', name: 'Missions', description: 'Mission work and evangelism', color: '#14B8A6', icon: '🌍' },
      { id: 'bible-study', name: 'Bible Study', description: 'Bible study materials and insights', color: '#22C55E', icon: '📚' },
      { id: 'fellowship', name: 'Fellowship', description: 'Fellowship and community building', color: '#EAB308', icon: '🤗' },
      { id: 'general', name: 'General', description: 'General church content', color: '#6B7280', icon: '🏛️' }
    ],
    sermon: [
      { id: 'teaching', name: 'Teaching', description: 'Doctrinal and educational sermons', color: '#3B82F6', icon: '📖' },
      { id: 'evangelistic', name: 'Evangelistic', description: 'Evangelism and salvation messages', color: '#10B981', icon: '✝️' },
      { id: 'prophetic', name: 'Prophetic', description: 'Prophetic messages and revelations', color: '#8B5CF6', icon: '🔮' },
      { id: 'pastoral', name: 'Pastoral', description: 'Pastoral care and counseling', color: '#F59E0B', icon: '👨‍💼' },
      { id: 'worship', name: 'Worship', description: 'Worship and praise messages', color: '#EC4899', icon: '🎵' },
      { id: 'prayer', name: 'Prayer', description: 'Prayer-focused messages', color: '#A855F7', icon: '🙏' },
      { id: 'testimony', name: 'Testimony', description: 'Testimony and personal stories', color: '#14B8A6', icon: '💬' },
      { id: 'special-occasion', name: 'Special Occasion', description: 'Special events and celebrations', color: '#F97316', icon: '🎉' }
    ],
    event: [
      { id: 'service', name: 'Service', description: 'Regular church services', color: '#3B82F6', icon: '⛪' },
      { id: 'prayer-meeting', name: 'Prayer Meeting', description: 'Prayer meetings and intercession', color: '#10B981', icon: '🙏' },
      { id: 'bible-study', name: 'Bible Study', description: 'Bible study sessions', color: '#8B5CF6', icon: '📚' },
      { id: 'youth-program', name: 'Youth Program', description: 'Youth activities and programs', color: '#F59E0B', icon: '👥' },
      { id: 'children-program', name: 'Children Program', description: 'Children activities and programs', color: '#EC4899', icon: '👶' },
      { id: 'men-fellowship', name: 'Men Fellowship', description: 'Men fellowship meetings', color: '#6366F1', icon: '👨' },
      { id: 'women-fellowship', name: 'Women Fellowship', description: 'Women fellowship meetings', color: '#A855F7', icon: '👩' },
      { id: 'conference', name: 'Conference', description: 'Conferences and seminars', color: '#14B8A6', icon: '🎤' },
      { id: 'seminar', name: 'Seminar', description: 'Educational seminars and workshops', color: '#F97316', icon: '📝' },
      { id: 'workshop', name: 'Workshop', description: 'Hands-on workshops and training', color: '#EAB308', icon: '🔧' },
      { id: 'concert', name: 'Concert', description: 'Musical concerts and performances', color: '#06B6D4', icon: '🎵' },
      { id: 'outreach', name: 'Outreach', description: 'Community outreach and evangelism', color: '#84CC16', icon: '🤝' },
      { id: 'community-service', name: 'Community Service', description: 'Community service activities', color: '#22C55E', icon: '❤️' },
      { id: 'wedding', name: 'Wedding', description: 'Wedding ceremonies and celebrations', color: '#EF4444', icon: '💒' },
      { id: 'dedication', name: 'Dedication', description: 'Baby dedications and ceremonies', color: '#A3E635', icon: '👶' },
      { id: 'memorial', name: 'Memorial', description: 'Memorial services and remembrances', color: '#6B7280', icon: '🕯️' },
      { id: 'fellowship', name: 'Fellowship', description: 'Fellowship and social events', color: '#F59E0B', icon: '🤗' },
      { id: 'retreat', name: 'Retreat', description: 'Spiritual retreats and getaways', color: '#8B5CF6', icon: '🏔️' },
      { id: 'revival', name: 'Revival', description: 'Revival meetings and services', color: '#EC4899', icon: '🔥' },
      { id: 'training', name: 'Training', description: 'Training and development programs', color: '#06B6D4', icon: '🎓' },
      { id: 'other', name: 'Other', description: 'Other events and activities', color: '#6B7280', icon: '📅' }
    ]
  };

  // Default tags for different content types
  const defaultTags = {
    blog: [
      'faith', 'bible', 'prayer', 'worship', 'family', 'marriage', 'parenting', 'youth', 'children', 'ministry', 'outreach', 'testimony', 'devotional', 'encouragement', 'hope', 'love', 'grace', 'forgiveness', 'salvation', 'discipleship', 'leadership', 'service', 'community', 'fellowship', 'gratitude', 'perseverance', 'trust', 'obedience', 'holiness', 'purpose', 'calling'
    ],
    sermon: [
      'gospel', 'salvation', 'repentance', 'faith', 'grace', 'mercy', 'love', 'forgiveness', 'holiness', 'obedience', 'worship', 'prayer', 'praise', 'thanksgiving', 'hope', 'joy', 'peace', 'patience', 'kindness', 'goodness', 'faithfulness', 'gentleness', 'self-control', 'discipleship', 'evangelism', 'missions', 'prophecy', 'healing', 'deliverance', 'blessing', 'covenant'
    ],
    event: [
      'worship', 'prayer', 'fellowship', 'teaching', 'training', 'outreach', 'evangelism', 'celebration', 'dedication', 'memorial', 'conference', 'seminar', 'workshop', 'retreat', 'revival', 'youth', 'children', 'men', 'women', 'family', 'community', 'service', 'ministry', 'leadership', 'discipleship', 'music', 'drama', 'testimony', 'blessing', 'encouragement'
    ]
  };

  /**
   * Load categories and tags from storage
   */
  const loadCategoriesAndTags = useCallback(() => {
    try {
      // Load categories
      const savedCategories = storageService.getLocal(categoriesKey) || defaultCategories[contentType] || [];
      setCategories(savedCategories);

      // Load tags
      const savedTags = storageService.getLocal(tagsKey) || defaultTags[contentType] || [];
      setTags(savedTags);

      // Load hierarchy
      const savedHierarchy = storageService.getLocal(hierarchyKey) || {};
      setCategoryHierarchy(savedHierarchy);

      // Load analytics
      if (enableTagAnalytics) {
        const savedAnalytics = storageService.getLocal(analyticsKey) || {};
        setCategoryStats(savedAnalytics.categories || {});
        setTagStats(savedAnalytics.tags || {});
      }
    } catch (error) {
      console.error('Error loading categories and tags:', error);
    }
  }, [contentType, categoriesKey, tagsKey, hierarchyKey, analyticsKey, enableTagAnalytics]);

  /**
   * Save categories and tags to storage
   */
  const saveCategoriesAndTags = useCallback(() => {
    try {
      storageService.setLocal(categoriesKey, categories);
      storageService.setLocal(tagsKey, tags);
      storageService.setLocal(hierarchyKey, categoryHierarchy);
      
      if (enableTagAnalytics) {
        const analytics = {
          categories: categoryStats,
          tags: tagStats,
          lastUpdated: new Date().toISOString()
        };
        storageService.setLocal(analyticsKey, analytics);
      }
    } catch (error) {
      console.error('Error saving categories and tags:', error);
    }
  }, [categories, tags, categoryHierarchy, categoryStats, tagStats, categoriesKey, tagsKey, hierarchyKey, analyticsKey, enableTagAnalytics]);

  /**
   * Add new category
   */
  const addCategory = useCallback((categoryData) => {
    const newCategory = {
      id: categoryData.id || `category-${Date.now()}`,
      name: categoryData.name,
      description: categoryData.description || '',
      color: categoryData.color || '#6B7280',
      icon: categoryData.icon || '📁',
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  /**
   * Update category
   */
  const updateCategory = useCallback((categoryId, updates) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat
    ));
  }, []);

  /**
   * Delete category
   */
  const deleteCategory = useCallback((categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  /**
   * Add new tag
   */
  const addTag = useCallback((tagName) => {
    const normalizedTag = tagName.toLowerCase().trim();
    
    if (!tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
      return normalizedTag;
    }
    return null;
  }, [tags]);

  /**
   * Remove tag
   */
  const removeTag = useCallback((tagName) => {
    setTags(prev => prev.filter(tag => tag !== tagName.toLowerCase()));
  }, []);

  /**
   * Get tag suggestions based on input
   */
  const getTagSuggestions = useCallback((input, maxSuggestions = 10) => {
    if (!input || input.length < 2) return [];

    const normalizedInput = input.toLowerCase();
    const suggestions = tags
      .filter(tag => tag.includes(normalizedInput))
      .sort((a, b) => {
        // Prioritize exact matches and popular tags
        const aExact = a === normalizedInput;
        const bExact = b === normalizedInput;
        const aPopular = tagStats[a] || 0;
        const bPopular = tagStats[b] || 0;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return bPopular - aPopular;
      })
      .slice(0, maxSuggestions);

    setTagSuggestions(suggestions);
    return suggestions;
  }, [tags, tagStats]);

  /**
   * Get popular tags
   */
  const getPopularTags = useCallback((limit = 20) => {
    const popular = Object.entries(tagStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);

    setPopularTags(popular);
    return popular;
  }, [tagStats]);

  /**
   * Update tag usage statistics
   */
  const updateTagUsage = useCallback((tagList) => {
    if (!enableTagAnalytics) return;

    setTagStats(prev => {
      const newStats = { ...prev };
      tagList.forEach(tag => {
        newStats[tag] = (newStats[tag] || 0) + 1;
      });
      return newStats;
    });
  }, [enableTagAnalytics]);

  /**
   * Update category usage statistics
   */
  const updateCategoryUsage = useCallback((categoryId) => {
    if (!enableTagAnalytics) return;

    setCategoryStats(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 0) + 1
    }));

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, usageCount: (cat.usageCount || 0) + 1 }
        : cat
    ));
  }, [enableTagAnalytics]);

  /**
   * Get category hierarchy
   */
  const getCategoryHierarchy = useCallback(() => {
    return categoryHierarchy;
  }, [categoryHierarchy]);

  /**
   * Set category hierarchy
   */
  const setCategoryHierarchyData = useCallback((hierarchy) => {
    setCategoryHierarchy(hierarchy);
  }, []);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  /**
   * Get category statistics
   */
  const getCategoryStatistics = useCallback(() => {
    return {
      total: categories.length,
      usage: categoryStats,
      popular: Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([id, count]) => ({
          id,
          name: getCategoryById(id)?.name || id,
          count
        }))
    };
  }, [categories, categoryStats, getCategoryById]);

  /**
   * Get tag statistics
   */
  const getTagStatistics = useCallback(() => {
    return {
      total: tags.length,
      usage: tagStats,
      popular: popularTags,
      suggestions: tagSuggestions
    };
  }, [tags, tagStats, popularTags, tagSuggestions]);

  /**
   * Validate category
   */
  const validateCategory = useCallback((categoryData) => {
    const errors = [];

    if (!categoryData.name || categoryData.name.trim().length < 2) {
      errors.push('Category name must be at least 2 characters');
    }

    if (categoryData.name && categoryData.name.length > 50) {
      errors.push('Category name cannot exceed 50 characters');
    }

    if (categoryData.description && categoryData.description.length > 200) {
      errors.push('Category description cannot exceed 200 characters');
    }

    // Check for duplicate names
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryData.name.toLowerCase() && 
      cat.id !== categoryData.id
    );
    if (existingCategory) {
      errors.push('A category with this name already exists');
    }

    return errors;
  }, [categories]);

  /**
   * Validate tags
   */
  const validateTags = useCallback((tagList) => {
    const errors = [];

    if (tagList.length > maxTagsPerContent) {
      errors.push(`Cannot have more than ${maxTagsPerContent} tags`);
    }

    tagList.forEach(tag => {
      if (tag.length < 2) {
        errors.push('Tags must be at least 2 characters');
      }
      if (tag.length > 30) {
        errors.push('Tags cannot exceed 30 characters');
      }
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
        errors.push('Tags can only contain letters, numbers, spaces, hyphens, and underscores');
      }
    });

    return errors;
  }, [maxTagsPerContent]);

  // Initialize on mount
  useEffect(() => {
    loadCategoriesAndTags();
  }, [loadCategoriesAndTags]);

  // Save when data changes
  useEffect(() => {
    saveCategoriesAndTags();
  }, [saveCategoriesAndTags]);

  // Load popular tags on mount
  useEffect(() => {
    getPopularTags();
  }, [getPopularTags]);

  return {
    // State
    categories,
    tags,
    categoryHierarchy,
    tagSuggestions,
    popularTags,
    categoryStats,
    tagStats,

    // Category management
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryHierarchy,
    setCategoryHierarchyData,
    validateCategory,

    // Tag management
    addTag,
    removeTag,
    getTagSuggestions,
    getPopularTags,
    validateTags,

    // Statistics and analytics
    updateTagUsage,
    updateCategoryUsage,
    getCategoryStatistics,
    getTagStatistics,

    // Configuration
    maxTagsPerContent,
    enableAutoSuggestions,
    enableCategoryHierarchy,
    enableTagAnalytics
  };
};

export default useContentCategories; 