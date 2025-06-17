import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with multiple size variants
 * and church brand styling. Supports full-screen overlay mode.
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.overlay - Show as full-screen overlay
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Color variant: 'primary', 'secondary', 'white'
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  overlay = false, 
  className = '',
  color = 'primary'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color configurations
  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-4 border-solid rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      
      {/* Loading text */}
      {text && (
        <p 
          className={`
            mt-3 font-medium text-gray-600 dark:text-gray-300
            ${textSizeClasses[size]}
          `}
          aria-live="polite"
        >
          {text}
        </p>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">Loading, please wait...</span>
    </div>
  );

  // Return overlay version if requested
  if (overlay) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          {spinnerElement}
        </div>
      </div>
    );
  }

  return spinnerElement;
};

/**
 * LoadingPage Component
 * 
 * Full-page loading component for page transitions
 */
export const LoadingPage = ({ message = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="xl" text={message} color="primary" />
    </div>
  </div>
);

/**
 * LoadingButton Component
 * 
 * Button with integrated loading state
 */
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  onClick,
  className = '',
  variant = 'primary',
  ...props 
}) => {
  const baseClasses = "relative px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary disabled:bg-gray-400",
    secondary: "bg-secondary text-white hover:bg-orange-600 focus:ring-secondary disabled:bg-gray-400",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-400 disabled:text-gray-400"
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${isDisabled ? 'cursor-not-allowed' : ''}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

/**
 * LoadingCard Component
 * 
 * Card skeleton for loading states
 */
export const LoadingCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      
      {/* Content lines */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between mt-6">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

/**
 * LoadingTable Component
 * 
 * Table skeleton for loading states
 */
export const LoadingTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Table header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export { LoadingSpinner };
export default LoadingSpinner;