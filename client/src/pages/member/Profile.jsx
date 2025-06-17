import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { memberService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEOHead from '../../components/common/SEOHead';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Shield, 
  Camera,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Member Profile Page Component
 * Allows members to view and edit their profile information
 * 
 * Features:
 * - Personal information management
 * - Profile photo upload
 * - Ministry involvement tracking
 * - Password change functionality
 * - Activity overview
 * 
 * @component
 * @returns {JSX.Element} Profile page component
 */
const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [uploading, setUploading] = useState(false);

  /**
   * Fetch member profile data on component mount
   */
  useEffect(() => {
    fetchProfileData();
  }, []);

  /**
   * Fetch profile data from API
   */
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getProfile();
      setProfileData(response.data);
      setEditedData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle profile photo upload
   * @param {Event} event - File input change event
   */
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await memberService.uploadProfilePhoto(formData);
      
      setProfileData(prev => ({
        ...prev,
        profilePhoto: response.data.profilePhoto
      }));
      
      showNotification('Profile photo updated successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification('Failed to upload profile photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle profile information update
   */
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const response = await memberService.updateProfile(editedData);
      
      setProfileData(response.data);
      setIsEditing(false);
      updateUser(response.data);
      
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      await memberService.changePassword(passwordData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      
      showNotification('Password changed successfully', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Toggle password visibility
   * @param {string} field - Password field name
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="My Profile - Haven Word Church"
        description="Manage your profile information and church involvement"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and church involvement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  {/* Profile Photo */}
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profileData?.profilePhoto ? (
                        <img
                          src={profileData.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Photo Upload Button */}
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                        <LoadingSpinner size="small" />
                      </div>
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    {profileData?.firstName} {profileData?.lastName}
                  </h2>
                  <p className="text-gray-600">{profileData?.email}</p>
                  
                  {profileData?.membershipType && (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {profileData.membershipType}
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profileData?.attendanceCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Services Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profileData?.ministriesCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Ministries</div>
                  </div>
                </div>

                {/* Member Since */}
                {profileData?.joinDate && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Member since {formatDate(profileData.joinDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.firstName || ''}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            firstName: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                          <User className="w-4 h-4 text-gray-400" />
                          {profileData?.firstName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.lastName || ''}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            lastName: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                          <User className="w-4 h-4 text-gray-400" />
                          {profileData?.lastName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {profileData?.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact admin to change email address
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.phone || ''}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+234 XXX XXX XXXX"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {profileData?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedData.dateOfBirth ? editedData.dateOfBirth.split('T')[0] : ''}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            dateOfBirth: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {profileData?.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editedData.address || ''}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            address: e.target.value
                          }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      ) : (
                        <div className="flex items-start gap-2 text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{profileData?.address || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ministry Involvement */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ministry Involvement
                  </h3>
                </div>
                <div className="p-6">
                  {profileData?.ministries && profileData.ministries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.ministries.map((ministry, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Heart className="w-5 h-5 text-red-500" />
                          <div>
                            <div className="font-medium text-gray-900">{ministry.name}</div>
                            <div className="text-sm text-gray-600">{ministry.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">You're not currently involved in any ministries.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Contact the church office to join a ministry.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security Settings
                  </h3>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="max-w-md space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              newPassword: e.target.value
                            }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              confirmPassword: e.target.value
                            }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Update Password Button */}
                      <button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;