import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import { 
  Settings, 
  Palette, 
  Globe, 
  Shield, 
  Save,
  RefreshCw
} from 'lucide-react';

const SiteSettings = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Haven Word Church',
      siteDescription: 'A place of worship, fellowship, and spiritual growth',
      siteUrl: 'https://havenwordchurch.com',
      contactEmail: 'info@havenwordchurch.com',
      contactPhone: '+234 123 456 7890',
      address: '123 Church Street, Lagos, Nigeria',
      timezone: 'Africa/Lagos',
      language: 'en'
    },
    appearance: {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      accentColor: '#10B981',
      darkMode: 'auto',
      fontFamily: 'Inter',
      logoUrl: '',
      faviconUrl: ''
    },
    content: {
      allowComments: true,
      moderateComments: true,
      allowGuestPosts: false,
      autoApprovePastors: true,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'webp', 'mp3', 'mp4', 'pdf']
    },
    notifications: {
      emailNotifications: true,
      newUserNotification: true,
      newContentNotification: true,
      weeklyDigest: true,
      smsNotifications: false
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      enableTwoFactor: false,
      allowRegistration: true
    }
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiCall('GET', '/admin/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiCall('PUT', '/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    // TODO: Replace with custom confirmation modal
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setLoading(true);
      try {
        await apiCall('POST', '/admin/settings/reset');
        await loadSettings();
        alert('Settings reset to default successfully!');
      } catch (error) {
        console.error('Error resetting settings:', error);
        alert('Failed to reset settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const TabButton = ({ id, title, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {title}
    </button>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={settings.general.contactPhone}
            onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Address
        </label>
        <textarea
          value={settings.general.address}
          onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
            <option value="ha">Hausa</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Color
          </label>
          <input
            type="color"
            value={settings.appearance.secondaryColor}
            onChange={(e) => handleSettingChange('appearance', 'secondaryColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Accent Color
          </label>
          <input
            type="color"
            value={settings.appearance.accentColor}
            onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dark Mode
          </label>
          <select
            value={settings.appearance.darkMode}
            onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Font Family
          </label>
          <select
            value={settings.appearance.fontFamily}
            onChange={(e) => handleSettingChange('appearance', 'fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={settings.appearance.logoUrl}
            onChange={(e) => handleSettingChange('appearance', 'logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Favicon URL
          </label>
          <input
            type="url"
            value={settings.appearance.faviconUrl}
            onChange={(e) => handleSettingChange('appearance', 'faviconUrl', e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Allow Comments</h4>
            <p className="text-sm text-gray-500">Enable commenting on blog posts and sermons</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.content.allowComments}
              onChange={(e) => handleSettingChange('content', 'allowComments', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Moderate Comments</h4>
            <p className="text-sm text-gray-500">Require admin approval for comments</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.content.moderateComments}
              onChange={(e) => handleSettingChange('content', 'moderateComments', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Allow Guest Posts</h4>
            <p className="text-sm text-gray-500">Allow non-registered users to submit content</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.content.allowGuestPosts}
              onChange={(e) => handleSettingChange('content', 'allowGuestPosts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-approve Pastors</h4>
            <p className="text-sm text-gray-500">Automatically approve content from pastors</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.content.autoApprovePastors}
              onChange={(e) => handleSettingChange('content', 'autoApprovePastors', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={settings.content.maxFileSize}
            onChange={(e) => handleSettingChange('content', 'maxFileSize', parseInt(e.target.value))}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allowed File Types
          </label>
          <input
            type="text"
            value={settings.content.allowedFileTypes.join(', ')}
            onChange={(e) => handleSettingChange('content', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
            placeholder="jpg, png, webp, mp3, mp4, pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Require Email Verification</h4>
            <p className="text-sm text-gray-500">Users must verify their email before accessing the site</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.requireEmailVerification}
              onChange={(e) => handleSettingChange('security', 'requireEmailVerification', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Allow Registration</h4>
            <p className="text-sm text-gray-500">Allow new users to register accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.allowRegistration}
              onChange={(e) => handleSettingChange('security', 'allowRegistration', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Enable Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.enableTwoFactor}
              onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            min="3"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Timeout (hours)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            min="1"
            max="168"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary-700 dark:text-white">
              Site Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configure site-wide settings, appearance, and preferences
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={resetSettings}
              variant="secondary"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <TabButton id="general" title="General" icon={Globe} />
            <TabButton id="appearance" title="Appearance" icon={Palette} />
            <TabButton id="content" title="Content" icon={Settings} />
            <TabButton id="security" title="Security" icon={Shield} />
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
        {activeTab === 'content' && renderContentSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
      </div>
    </div>
  );
};

export default SiteSettings;
