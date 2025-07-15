import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import SermonUploadForm from '../../components/forms/SermonUploadForm';
import Button from '../../components/ui/Button';

/**
 * UploadSermon Page Component
 * 
 * Dedicated page for pastors and staff to upload new sermons
 * Includes success/error handling and navigation
 */
const UploadSermon = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle successful sermon upload
   */
  const handleSuccess = (sermonData) => {
    setSuccess(true);
    setError(null);
    
    // Clear any draft data
    localStorage.removeItem('sermonDraft');
    
    // Show success message and redirect after delay
    setTimeout(() => {
      navigate('/admin/sermons');
    }, 3000);
  };

  /**
   * Handle upload error
   */
  const handleError = (error) => {
    setError(error);
    setSuccess(false);
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/sermons');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title="Upload Sermon - Admin Dashboard"
        description="Upload new sermons to the church website"
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/sermons')}
                className="mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Sermons
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload New Sermon
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share God's Word with the congregation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Sermon uploaded successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Redirecting to sermons page...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Upload failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error.message || 'An error occurred while uploading the sermon. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SermonUploadForm
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default UploadSermon; 