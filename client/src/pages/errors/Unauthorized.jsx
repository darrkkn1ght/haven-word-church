import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, LogIn, Home, UserPlus, Mail, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

/**
 * 401 Unauthorized Error Page
 * 
 * Modern, accessible unauthorized access page with clear explanation
 * and helpful navigation options for users
 */
const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
            401
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            This page requires authentication. Please log in to your account to continue.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            as={Link}
            to="/login"
            variant="primary"
            size="lg"
            leftIcon={<LogIn className="w-5 h-5" />}
            className="w-full"
          >
            Log In
          </Button>
          <Button
            as={Link}
            to="/"
            variant="outline"
            size="lg"
            leftIcon={<Home className="w-5 h-5" />}
            className="w-full"
          >
            Go Home
          </Button>
        </div>

        {/* Access Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Get Access
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <LogIn className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Existing Member?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Log in to your account to access member features.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <UserPlus className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">New to Church?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Register for a free account to join our community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Member Benefits */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Member Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Track Attendance', icon: '📊', color: 'blue' },
              { label: 'Prayer Requests', icon: '🙏', color: 'green' },
              { label: 'Event RSVP', icon: '📅', color: 'purple' },
              { label: 'Donation History', icon: '💝', color: 'pink' },
              { label: 'Member Directory', icon: '👥', color: 'indigo' },
              { label: 'Exclusive Content', icon: '🔒', color: 'orange' }
            ].map((benefit) => (
              <div
                key={benefit.label}
                className={`flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-${benefit.color}-500 hover:shadow-md transition-all duration-200 group`}
              >
                <span className="text-lg mr-2">{benefit.icon}</span>
                <span className={`text-gray-700 dark:text-gray-300 group-hover:text-${benefit.color}-600 font-medium`}>
                  {benefit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration CTA */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white mb-8">
          <h3 className="text-xl font-bold mb-3">Join Our Church Family</h3>
          <p className="mb-4 opacity-90">
            Become a member to access exclusive features and stay connected with our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/register"
              variant="white"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Register Now
            </Button>
            <Button
              as={Link}
              to="/about"
              variant="outline-white"
              size="md"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Need Help?
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            If you're having trouble accessing your account or need assistance, 
            our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/contact"
              variant="secondary"
              size="md"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Contact Support
            </Button>
            <Button
              as={Link}
              to="/login"
              variant="outline"
              size="md"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Try Login Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
