import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/ui/Button';

const BlogCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { apiCall } = useApi();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    tags: [],
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  // Blog categories
  const categories = [
    { value: 'sermon-notes', label: 'Sermon Notes' },
    { value: 'testimony', label: 'Testimony' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'devotional', label: 'Devotional' },
    { value: 'church-news', label: 'Church News' },
    { value: 'community-outreach', label: 'Community Outreach' },
    { value: 'youth-ministry', label: 'Youth Ministry' },
    { value: 'women-ministry', label: 'Women Ministry' },
    { value: 'men-ministry', label: 'Men Ministry' },
    { value: 'children-ministry', label: 'Children Ministry' },
    { value: 'prayer-request', label: 'Prayer Request' },
    { value: 'missions', label: 'Missions' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'general', label: 'General' }
  ];

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/blog/create' } });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt cannot exceed 500 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        featuredImage: 'Please upload a valid image (JPEG, PNG, or WebP)'
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        featuredImage: 'Image size must be less than 5MB'
      }));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiCall('POST', '/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        featuredImage: {
          ...prev.featuredImage,
          url: response.url
        }
      }));

      setErrors(prev => ({
        ...prev,
        featuredImage: ''
      }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        featuredImage: 'Failed to upload image. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await apiCall('POST', '/blog', {
        ...formData,
        status: 'draft',
        moderationStatus: 'pending'
      });
      
      // Show success message
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await apiCall('POST', '/blog', {
        ...formData,
        status: 'draft',
        moderationStatus: 'pending'
      });
      
      alert('Blog post submitted for review! You will be notified when it\'s approved.');
      navigate('/blog');
    } catch (error) {
      console.error('Error submitting blog:', error);
      alert('Failed to submit blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {formData.title || 'Blog Title'}
      </h1>
      
      {formData.featuredImage.url && (
        <div className="mb-6">
          <img 
            src={formData.featuredImage.url} 
            alt={formData.featuredImage.alt || 'Featured image'}
            className="w-full h-64 object-cover rounded-lg"
          />
          {formData.featuredImage.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              {formData.featuredImage.caption}
            </p>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {categories.find(cat => cat.value === formData.category)?.label || 'General'}
        </span>
        {formData.tags.map(tag => (
          <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2">
            #{tag}
          </span>
        ))}
      </div>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">
        {formData.excerpt || 'Blog excerpt will appear here...'}
      </p>
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>Blog content will appear here...</p>' }} />
      </div>
    </div>
  );

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary-700 dark:text-white">
          Create New Blog Post
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your thoughts, testimonies, or church announcements with the community.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setPreviewMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !previewMode
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              previewMode
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your blog title..."
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.excerpt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief summary of your blog post..."
                maxLength={500}
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.excerpt.length}/500 characters
              </p>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Add a tag..."
                  maxLength={20}
                />
                <Button
                  onClick={addTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  className="px-4 py-2"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.tags.length}/10 tags
              </p>
            </div>

            {/* Featured Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                />
                {formData.featuredImage.url && (
                  <div className="relative">
                    <img
                      src={formData.featuredImage.url}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Image alt text"
                      value={formData.featuredImage.alt}
                      onChange={(e) => handleInputChange('featuredImage', {
                        ...formData.featuredImage,
                        alt: e.target.value
                      })}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Image caption (optional)"
                      value={formData.featuredImage.caption}
                      onChange={(e) => handleInputChange('featuredImage', {
                        ...formData.featuredImage,
                        caption: e.target.value
                      })}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}
                {errors.featuredImage && (
                  <p className="text-sm text-red-600">{errors.featuredImage}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Write your blog content here... You can use basic HTML tags like <strong>, <em>, <a>, <ul>, <li>, etc."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Tip: You can use basic HTML tags for formatting. Example: &lt;strong&gt;bold&lt;/strong&gt;, &lt;em&gt;italic&lt;/em&gt;, &lt;a href="url"&gt;link&lt;/a&gt;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                onClick={saveDraft}
                disabled={saving}
                variant="secondary"
                className="px-6 py-2"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={submitForReview}
                disabled={loading}
                className="px-6 py-2"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BlogCreate; 