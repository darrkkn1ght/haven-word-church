import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import Button from '../ui/Button';

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // TODO: Send error to error reporting service in production
    // Example: Sentry, LogRocket, etc.
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">
                Oops!
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                An unexpected error occurred in the application. Our team has been notified and is working to fix the issue.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Button
                onClick={this.handleRefresh}
                variant="primary"
                size="lg"
                leftIcon={<RefreshCw className="w-5 h-5" />}
                className="w-full"
              >
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="lg"
                leftIcon={<Home className="w-5 h-5" />}
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Bug className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Error Details (Development)
                  </h3>
                </div>
                
                <Button
                  onClick={this.toggleDetails}
                  variant="outline"
                  size="sm"
                  className="mb-4"
                >
                  {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
                
                {this.state.showDetails && (
                  <div className="text-left space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Error Message:</h4>
                      <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-800 dark:text-red-200 overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Component Stack:</h4>
                        <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Help Section */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Still Having Issues?</h3>
              <p className="mb-4 opacity-90">
                If this problem persists, please contact our support team and include the error details.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  href="mailto:support@havenwordchurch.org?subject=Application Error"
                  variant="white"
                  size="md"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Contact Support
                </Button>
                <Button
                  onClick={this.handleRefresh}
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
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
