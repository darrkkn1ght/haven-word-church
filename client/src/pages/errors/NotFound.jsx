import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Phone, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';

/**
 * 404 Not Found Error Page
 * 
 * Modern, accessible error page with helpful navigation options
 * and church-specific content to guide users back to the site
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, you're still welcome in our church family!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            as={Link}
            to="/"
            variant="primary"
            size="lg"
            leftIcon={<Home className="w-5 h-5" />}
            className="w-full"
          >
            Go Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        {/* Popular Pages */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { to: '/about', label: 'About Us', icon: '🏛️' },
              { to: '/sermons', label: 'Sermons', icon: '📖' },
              { to: '/events', label: 'Events', icon: '📅' },
              { to: '/ministries', label: 'Ministries', icon: '🤝' },
              { to: '/contact', label: 'Contact', icon: '📞' },
              { to: '/blog', label: 'Blog', icon: '✍️' }
            ].map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all duration-200 group"
              >
                <span className="text-lg mr-2">{page.icon}</span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary font-medium">
                  {page.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Can't find what you're looking for?
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try searching our site or contact us directly for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/contact"
              variant="secondary"
              size="md"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Contact Us
            </Button>
            <Button
              as={Link}
              to="/sermons"
              variant="outline"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Browse Sermons
            </Button>
          </div>
        </div>

        {/* Church Info */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Need Immediate Help?</h3>
          <p className="mb-4 opacity-90">
            We're here to help you find what you need. Reach out to us anytime.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 opacity-80" />
              <span>+234 XXX XXX XXXX</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 opacity-80" />
              <span>info@havenwordchurch.org</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
