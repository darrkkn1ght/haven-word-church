import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Upload, 
  FileAudio, 
  FileVideo, 
  FileText, 
  Image, 
  X, 
  Save, 
  Eye, 
  User,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { useApi } from '../../hooks/useApi';
import { FILE_LIMITS } from '../../../shared/constants';

/**
 * SermonUploadForm Component
 * 
 * Comprehensive sermon upload interface for pastors and staff
 * Supports audio/video uploads, metadata management, and draft saving
 * 
 * @param {Object} props - Component props
 * @param {Object} props.sermon - Existing sermon data for editing
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onCancel - Cancel callback
 */
const SermonUploadForm = ({ 
  sermon = null, 
  onSuccess, 
  onError, 
  onCancel 
}) => {
  // API hook
  const { post, upload, loading, error } = useApi();

  // Form state
  const [formData, setFormData] = useState({
    title: sermon?.title || '',
    description: sermon?.description || '',
    scriptureReference: sermon?.scriptureReference || '',
    keyVerse: sermon?.keyVerse || '',
    series: {
      name: sermon?.series?.name || '',
      part: sermon?.series?.part || '',
      totalParts: sermon?.series?.totalParts || ''
    },
    speaker: {
      name: sermon?.speaker?.name || '',
      title: sermon?.speaker?.title || '',
      bio: sermon?.speaker?.bio || '',
      isGuestSpeaker: sermon?.speaker?.isGuestSpeaker || false
    },
    serviceType: sermon?.serviceType || 'Sunday Service',
    serviceDate: sermon?.serviceDate ? new Date(sermon.serviceDate).toISOString().split('T')[0] : '',
    category: sermon?.category || 'Teaching',
    tags: sermon?.tags || [],
    status: sermon?.status || 'draft',
    isFeatured: sermon?.isFeatured || false,
    metaDescription: sermon?.metaDescription || ''
  });

  // File upload state
  const [mediaFiles, setMediaFiles] = useState({
    audio: null,
    video: null,
    transcript: null,
    slides: null,
    thumbnail: null
  });

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  // Preview state
  const [previewMode, setPreviewMode] = useState(false);

  // Refs
  const fileInputs = {
    audio: useRef(null),
    video: useRef(null),
    transcript: useRef(null),
    slides: useRef(null),
    thumbnail: useRef(null)
  };

  // Service types
  const serviceTypes = [
    'Sunday Service',
    'Midweek Service', 
    'Prayer Meeting',
    'Youth Service',
    'Women Fellowship',
    'Men Fellowship',
    'Special Service',
    'Conference',
    'Retreat'
  ];

  // Categories
  const categories = [
    'Teaching',
    'Evangelistic',
    'Prophetic',
    'Pastoral',
    'Worship',
    'Prayer',
    'Testimony',
    'Special Occasion'
  ];

  /**
   * Validate form field
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Sermon title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 200) return 'Title cannot exceed 200 characters';
        break;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        if (value.length > 1000) return 'Description cannot exceed 1000 characters';
        break;
      case 'scriptureReference':
        if (!value.trim()) return 'Scripture reference is required';
        if (value.length < 3) return 'Scripture reference must be at least 3 characters';
        break;
      case 'speaker.name':
        if (!value.trim()) return 'Speaker name is required';
        if (value.length < 2) return 'Speaker name must be at least 2 characters';
        break;
      case 'serviceDate':
        if (!value) return 'Service date is required';
        if (new Date(value) > new Date()) return 'Service date cannot be in the future';
        break;
      default:
        break;
    }
    return '';
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'scriptureReference', 'speaker.name', 'serviceDate'];
    requiredFields.forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], formData)
        : formData[field];
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });

    // Validate series if provided
    if (formData.series.name && formData.series.part && formData.series.totalParts) {
      if (parseInt(formData.series.part) > parseInt(formData.series.totalParts)) {
        newErrors['series.part'] = 'Part number cannot exceed total parts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: fieldValue
          }
        };
      }
      return {
        ...prev,
        [name]: fieldValue
      };
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle field blur for validation
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  /**
   * Handle file upload
   */
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const limits = FILE_LIMITS;
    let isValid = true;
    let errorMessage = '';

    switch (type) {
      case 'audio':
        if (!limits.AUDIO_TYPES.includes(file.type)) {
          isValid = false;
          errorMessage = 'Please select a valid audio file (MP3, WAV, M4A)';
        }
        if (file.size > limits.AUDIO_MAX_SIZE) {
          isValid = false;
          errorMessage = `Audio file size must be less than ${limits.AUDIO_MAX_SIZE / 1024 / 1024}MB`;
        }
        break;
      case 'video':
        if (!limits.VIDEO_TYPES.includes(file.type)) {
          isValid = false;
          errorMessage = 'Please select a valid video file (MP4, WebM, AVI)';
        }
        if (file.size > limits.VIDEO_MAX_SIZE) {
          isValid = false;
          errorMessage = `Video file size must be less than ${limits.VIDEO_MAX_SIZE / 1024 / 1024}MB`;
        }
        break;
      case 'transcript':
      case 'slides':
        if (!limits.DOCUMENT_TYPES.includes(file.type)) {
          isValid = false;
          errorMessage = 'Please select a valid document file (PDF, DOC, DOCX)';
        }
        if (file.size > limits.DOCUMENT_MAX_SIZE) {
          isValid = false;
          errorMessage = `Document file size must be less than ${limits.DOCUMENT_MAX_SIZE / 1024 / 1024}MB`;
        }
        break;
      case 'thumbnail':
        if (!limits.IMAGE_TYPES.includes(file.type)) {
          isValid = false;
          errorMessage = 'Please select a valid image file (JPEG, PNG, WebP)';
        }
        if (file.size > limits.IMAGE_MAX_SIZE) {
          isValid = false;
          errorMessage = `Image file size must be less than ${limits.IMAGE_MAX_SIZE / 1024 / 1024}MB`;
        }
        break;
      default:
        break;
    }

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [`media.${type}`]: errorMessage
      }));
      e.target.value = '';
      return;
    }

    setMediaFiles(prev => ({
      ...prev,
      [type]: file
    }));

    // Clear error
    if (errors[`media.${type}`]) {
      setErrors(prev => ({
        ...prev,
        [`media.${type}`]: ''
      }));
    }
  };

  /**
   * Remove file
   */
  const removeFile = (type) => {
    setMediaFiles(prev => ({
      ...prev,
      [type]: null
    }));
    if (fileInputs[type].current) {
      fileInputs[type].current.value = '';
    }
  };

  /**
   * Handle tag input
   */
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag) && formData.tags.length < 20) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        e.target.value = '';
      }
    }
  };

  /**
   * Remove tag
   */
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  /**
   * Upload files to server
   */
  const uploadFiles = async () => {
    const uploadedMedia = {};
    
    for (const [type, file] of Object.entries(mediaFiles)) {
      if (file) {
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', type);
          formData.append('uploadType', 'sermons');
          
          const response = await upload('/api/upload', formData, {
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [type]: progress }));
            }
          });
          
          uploadedMedia[type] = response.data.url;
        } catch (error) {
          throw new Error(`Failed to upload ${type}: ${error.message}`);
        }
      }
    }
    
    return uploadedMedia;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      // Upload files first
      const uploadedMedia = await uploadFiles();
      
      // Prepare sermon data
      const sermonData = {
        ...formData,
        media: {
          audio: uploadedMedia.audio ? { url: uploadedMedia.audio } : undefined,
          video: uploadedMedia.video ? { url: uploadedMedia.video } : undefined,
          transcript: uploadedMedia.transcript ? { url: uploadedMedia.transcript } : undefined,
          slides: uploadedMedia.slides ? { url: uploadedMedia.slides } : undefined
        },
        featuredImageUrl: uploadedMedia.thumbnail
      };

      // Create or update sermon
      const endpoint = sermon ? `/api/sermons/${sermon.id}` : '/api/sermons';
      const method = sermon ? 'PUT' : 'POST';
      
      const response = await post(endpoint, sermonData);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error('Sermon upload error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Save as draft
   */
  const saveDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    // Save to localStorage for now
    localStorage.setItem('sermonDraft', JSON.stringify({
      formData,
      mediaFiles: Object.keys(mediaFiles).reduce((acc, key) => {
        if (mediaFiles[key]) {
          acc[key] = mediaFiles[key].name;
        }
        return acc;
      }, {})
    }));
  };

  /**
   * Load draft
   */
  const loadDraft = () => {
    const draft = localStorage.getItem('sermonDraft');
    if (draft) {
      const { formData: draftData } = JSON.parse(draft);
      setFormData(draftData);
    }
  };

  // Load draft on mount
  useEffect(() => {
    if (!sermon) {
      loadDraft();
    }
  }, [sermon]);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {sermon ? 'Edit Sermon' : 'Upload New Sermon'}
            </h2>
            <p className="text-blue-100 mt-1">
              Share God's Word with the congregation
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-white hover:bg-white/20"
            >
              {previewMode ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={saveDraft}
              className="text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sermon Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              placeholder="Enter sermon title"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Type *
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Date *
            </label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.serviceDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.serviceDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.serviceDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="Describe the sermon content and key points..."
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && (
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formData.description.length}/1000
            </span>
          </div>
        </div>

        {/* Scripture and Speaker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scripture Reference *
            </label>
            <input
              type="text"
              name="scriptureReference"
              value={formData.scriptureReference}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.scriptureReference ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              placeholder="e.g., John 3:16, Romans 8:28-30"
            />
            {errors.scriptureReference && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.scriptureReference}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Verse
            </label>
            <textarea
              name="keyVerse"
              value={formData.keyVerse}
              onChange={handleChange}
              rows={2}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Main verse or key scripture..."
              maxLength={500}
            />
          </div>
        </div>

        {/* Speaker Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Speaker Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speaker Name *
              </label>
              <input
                type="text"
                name="speaker.name"
                value={formData.speaker.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors['speaker.name'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Speaker's full name"
              />
              {errors['speaker.name'] && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors['speaker.name']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speaker Title
              </label>
              <input
                type="text"
                name="speaker.title"
                value={formData.speaker.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Senior Pastor, Guest Speaker"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speaker Bio
              </label>
              <textarea
                name="speaker.bio"
                value={formData.speaker.bio}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Brief biography or introduction..."
                maxLength={500}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="speaker.isGuestSpeaker"
                  checked={formData.speaker.isGuestSpeaker}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  This is a guest speaker
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Series Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Series Information (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Series Name
              </label>
              <input
                type="text"
                name="series.name"
                value={formData.series.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Faith Foundations"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Part Number
              </label>
              <input
                type="number"
                name="series.part"
                value={formData.series.part}
                onChange={handleChange}
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Parts
              </label>
              <input
                type="number"
                name="series.totalParts"
                value={formData.series.totalParts}
                onChange={handleChange}
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="5"
              />
            </div>
          </div>
          {errors['series.part'] && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['series.part']}
            </p>
          )}
        </div>

        {/* Media Upload */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Media Files
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audio File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputs.audio}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange('audio', e)}
                  className="hidden"
                />
                {mediaFiles.audio ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileAudio className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mediaFiles.audio.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('audio')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputs.audio.current?.click()}>
                    <FileAudio className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload audio file
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      MP3, WAV, M4A up to {FILE_LIMITS.AUDIO_MAX_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}
              </div>
              {uploadProgress.audio > 0 && uploadProgress.audio < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.audio}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Uploading: {uploadProgress.audio}%
                  </p>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputs.video}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('video', e)}
                  className="hidden"
                />
                {mediaFiles.video ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileVideo className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mediaFiles.video.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('video')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputs.video.current?.click()}>
                    <FileVideo className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload video file
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      MP4, WebM, AVI up to {FILE_LIMITS.VIDEO_MAX_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}
              </div>
              {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.video}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Uploading: {uploadProgress.video}%
                  </p>
                </div>
              )}
            </div>

            {/* Transcript Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transcript/Notes
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputs.transcript}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileChange('transcript', e)}
                  className="hidden"
                />
                {mediaFiles.transcript ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mediaFiles.transcript.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('transcript')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputs.transcript.current?.click()}>
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload transcript
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PDF, DOC, DOCX, TXT up to {FILE_LIMITS.DOCUMENT_MAX_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputs.thumbnail}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('thumbnail', e)}
                  className="hidden"
                />
                {mediaFiles.thumbnail ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mediaFiles.thumbnail.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('thumbnail')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputs.thumbnail.current?.click()}>
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload thumbnail
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      JPEG, PNG, WebP up to {FILE_LIMITS.IMAGE_MAX_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tags (press Enter to add)"
            onKeyDown={handleTagInput}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={formData.tags.length >= 20}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.tags.length}/20 tags
          </p>
        </div>

        {/* Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Publication Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Feature this sermon
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={2}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Brief description for search engines..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-400">
                {error.message || 'An error occurred while uploading the sermon'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading || uploading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={loading || uploading}
            disabled={loading || uploading}
          >
            {sermon ? 'Update Sermon' : 'Upload Sermon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

SermonUploadForm.propTypes = {
  sermon: PropTypes.object,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func
};

export default SermonUploadForm; 