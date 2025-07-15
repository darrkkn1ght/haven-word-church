import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Tag, 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BarChart3, 
  X
} from 'lucide-react';
import Button from '../ui/Button';
import useContentCategories from '../../hooks/useContentCategories';

/**
 * CategoryTagManager Component
 * 
 * Comprehensive category and tag management interface
 * Provides creation, editing, organization, and analytics for content categorization
 * 
 * @param {Object} props - Component props
 * @param {string} props.contentType - Type of content (blog, sermon, event, etc.)
 * @param {Array} props.selectedCategories - Currently selected categories
 * @param {Array} props.selectedTags - Currently selected tags
 * @param {Function} props.onCategoriesChange - Callback when categories change
 * @param {Function} props.onTagsChange - Callback when tags change
 * @param {Object} props.options - Management options
 */
const CategoryTagManager = ({
  contentType,
  selectedCategories = [],
  selectedTags = [],
  onCategoriesChange,
  onTagsChange,
  options = {}
}) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: '📁'
  });

  // Tag form state
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);

  // Add state for delete confirmation modal
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Category management hook
  const {
    categories,
    tags,
    popularTags,
    categoryStats,
    tagStats,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    getTagSuggestions,
    validateCategory,
    validateTags,
    getCategoryStatistics,
    getTagStatistics
  } = useContentCategories(contentType, options);

  /**
   * Handle category form submission
   */
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    
    const errors = validateCategory(categoryForm);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      setEditingCategory(null);
    } else {
      addCategory(categoryForm);
    }

    setCategoryForm({ name: '', description: '', color: '#6B7280', icon: '📁' });
    setShowCategoryForm(false);
  };

  /**
   * Handle tag input
   */
  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.length >= 2) {
      const suggestions = getTagSuggestions(value);
      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]);
    }
  };

  /**
   * Add tag
   */
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const errors = validateTags([tagInput]);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const newTag = addTag(tagInput);
    if (newTag && onTagsChange) {
      onTagsChange([...selectedTags, newTag]);
    }
    
    setTagInput('');
    setTagSuggestions([]);
  };

  /**
   * Remove tag
   */
  const handleRemoveTag = (tagToRemove) => {
    if (onTagsChange) {
      onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    }
  };

  /**
   * Toggle category selection
   */
  const toggleCategory = (categoryId) => {
    if (onCategoriesChange) {
      const isSelected = selectedCategories.includes(categoryId);
      const newCategories = isSelected
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategoriesChange(newCategories);
    }
  };

  /**
   * Edit category
   */
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon
    });
    setShowCategoryForm(true);
  };

  /**
   * Delete category
   */
  const handleDeleteCategory = (categoryId) => {
    setCategoryToDelete(categoryId);
  };

  /**
   * Filter categories
   */
  const getFilteredCategories = () => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'used') {
      filtered = filtered.filter(cat => (categoryStats[cat.id] || 0) > 0);
    } else if (filterType === 'unused') {
      filtered = filtered.filter(cat => (categoryStats[cat.id] || 0) === 0);
    }

    return filtered;
  };

  /**
   * Get category statistics
   */
  const categoryStatistics = getCategoryStatistics();
  const tagStatistics = getTagStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories & Tags
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Organize your {contentType} content
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="text-gray-600 hover:text-gray-800"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Usage Analytics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Analytics */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Categories:</span>
                  <span className="font-medium">{categoryStatistics.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most Used:</span>
                  <span className="font-medium">
                    {categoryStatistics.popular[0]?.name || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tag Analytics */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Tags:</span>
                  <span className="font-medium">{tagStatistics.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most Popular:</span>
                  <span className="font-medium">
                    {tagStatistics.popular[0] || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-1" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-1" />
            Tags ({tags.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="used">Used Categories</option>
              <option value="unused">Unused Categories</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCategoryForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredCategories().map((category) => (
              <div
                key={category.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {categoryStats[category.id] || 0} uses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                )}
                
                <div
                  className="w-full h-2 rounded mt-2"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {/* Add Tag Form */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Add new tag..."
                value={tagInput}
                onChange={handleTagInput}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              {/* Tag Suggestions */}
              {tagSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1">
                  {tagSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setTagInput(suggestion);
                        setTagSuggestions([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      onTagsChange([...selectedTags, tag]);
                    }
                  }}
                  disabled={selectedTags.includes(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                  <span className="ml-1 text-xs text-gray-500">
                    ({tagStats[tag] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="📁"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', color: '#6B7280', icon: '📁' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setCategoryToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteCategory(categoryToDelete);
                  setCategoryToDelete(null);
                  if (onCategoriesChange) {
                    onCategoriesChange(selectedCategories.filter(id => id !== categoryToDelete));
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CategoryTagManager.propTypes = {
  contentType: PropTypes.string.isRequired,
  selectedCategories: PropTypes.array,
  selectedTags: PropTypes.array,
  onCategoriesChange: PropTypes.func,
  onTagsChange: PropTypes.func,
  options: PropTypes.object
};

export default CategoryTagManager; 