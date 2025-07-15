import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home, AlertTriangle, Wifi, Server, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';

/**
 * 500 Server Error Page
 * 
 * Modern, accessible server error page with helpful recovery options
 * and clear communication about the issue
 */
const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Server className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">
            500
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Server Error
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Something went wrong on our end. Our team has been notified and is working to fix the issue.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleRefresh}
            variant="primary"
            size="lg"
            leftIcon={<RefreshCw className="w-5 h-5" />}
            className="w-full"
          >
            Try Again
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

        {/* Troubleshooting Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Troubleshooting Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <RefreshCw className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Refresh the Page</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sometimes a simple refresh can resolve temporary issues.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Wifi className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Check Connection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ensure you have a stable internet connection.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Server className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Clear Cache</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Try clearing your browser cache and cookies.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Contact Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If the problem persists, let us know.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What would you like to do?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { to: '/sermons', label: 'Listen to Sermons', icon: '📖', color: 'blue' },
              { to: '/events', label: 'View Events', icon: '📅', color: 'green' },
              { to: '/about', label: 'Learn About Us', icon: '🏛️', color: 'purple' },
              { to: '/contact', label: 'Get in Touch', icon: '📞', color: 'orange' },
              { to: '/blog', label: 'Read Blog', icon: '✍️', color: 'indigo' },
              { to: '/ministries', label: 'Join Ministries', icon: '🤝', color: 'pink' }
            ].map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className={`flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-${page.color}-500 hover:shadow-md transition-all duration-200 group`}
              >
                <span className="text-lg mr-2">{page.icon}</span>
                <span className={`text-gray-700 dark:text-gray-300 group-hover:text-${page.color}-600 font-medium`}>
                  {page.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Still Having Issues?</h3>
          <p className="mb-4 opacity-90">
            Our technical team is here to help. Contact us and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/contact"
              variant="white"
              size="md"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Contact Support
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline-white"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
