import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * ErrorMessage Component
 * 
 * A reusable component for displaying error messages with different variants
 * and styling options. Supports dismissible errors and retry functionality.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {string} props.title - Optional error title
 * @param {string} props.variant - Error variant: 'inline', 'card', 'banner', 'toast'
 * @param {boolean} props.dismissible - Whether the error can be dismissed
 * @param {Function} props.onDismiss - Callback when error is dismissed
 * @param {Function} props.onRetry - Callback for retry action
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcon - Whether to show the error icon
 */
const ErrorMessage = ({
  message,
  title,
  variant = 'inline',
  dismissible = false,
  onDismiss,
  onRetry,
  className = '',
  showIcon = true,
  ...props
}) => {
  if (!message) return null;

  const baseClasses = "flex items-start p-4 rounded-lg border";
  const iconClasses = "flex-shrink-0 w-5 h-5 text-red-500 mt-0.5";
  
  const variantClasses = {
    inline: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    card: "bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 shadow-sm",
    banner: "bg-red-500 border-red-600 text-white",
    toast: "bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 shadow-lg"
  };

  const iconVariants = {
    inline: <AlertCircle className={iconClasses} />,
    card: <AlertCircle className={iconClasses} />,
    banner: <AlertCircle className="flex-shrink-0 w-5 h-5 text-white mt-0.5" />,
    toast: <AlertCircle className={iconClasses} />
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      {/* Error Icon */}
      {showIcon && iconVariants[variant]}
      
      {/* Error Content */}
      <div className="flex-1 ml-3">
        {title && (
          <h3 className="text-sm font-medium mb-1">
            {title}
          </h3>
        )}
        <p className="text-sm">
          {message}
        </p>
        
        {/* Retry Button */}
        {onRetry && (
          <div className="mt-3">
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
      
      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4 text-red-500 dark:text-red-400" />
        </button>
      )}
    </div>
  );
};

/**
 * ErrorList Component
 * 
 * Displays multiple error messages in a list format
 */
export const ErrorList = ({ errors = [], variant = 'inline', className = '' }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <ErrorMessage
          key={index}
          message={typeof error === 'string' ? error : error.message}
          title={error.title}
          variant={variant}
          dismissible={error.dismissible}
          onDismiss={error.onDismiss}
          onRetry={error.onRetry}
          showIcon={error.showIcon !== false}
        />
      ))}
    </div>
  );
};

/**
 * ErrorState Component
 * 
 * Full-page error state for when components fail to load
 */
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  onGoHome,
  className = ''
}) => {
  return (
    <div className={`min-h-[400px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        {/* Error Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              size="md"
            >
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['inline', 'card', 'banner', 'toast']),
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  onRetry: PropTypes.func,
  className: PropTypes.string,
  showIcon: PropTypes.bool
};

ErrorList.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        message: PropTypes.string.isRequired,
        title: PropTypes.string,
        dismissible: PropTypes.bool,
        onDismiss: PropTypes.func,
        onRetry: PropTypes.func,
        showIcon: PropTypes.bool
      })
    ])
  ),
  variant: PropTypes.oneOf(['inline', 'card', 'banner', 'toast']),
  className: PropTypes.string
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  onGoHome: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage; 