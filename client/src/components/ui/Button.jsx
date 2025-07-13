import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Comprehensive Button Component for Haven Word Church
 * 
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, danger)
 * - Multiple sizes (sm, md, lg, xl)
 * - Loading states with spinner
 * - Icon support (left/right positioning)
 * - Disabled states
 * - Full accessibility (ARIA, keyboard navigation)
 * - Nigerian church context styling
 * 
 * @param {Object} props - Component props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Button size
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {'button'|'submit'|'reset'} props.type - Button type attribute
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessibility label
 * @param {string} props.ariaDescribedBy - Accessibility description reference
 * @param {Object} props.rest - Additional props to spread
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ...rest
}) => {
  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-2xl
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-accent-700
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 hover:scale-105
    shadow-xl hover:shadow-2xl
    ${fullWidth ? 'w-full' : ''}
  `.trim();

  // Variant styles (modern, blue/cyan, 3D)
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600
      text-white
      shadow-[0_4px_24px_0_rgba(37,99,235,0.18)]
      hover:from-primary-400 hover:via-accent-400 hover:to-primary-500
      dark:bg-gradient-to-r dark:from-primary-600 dark:via-accent-700 dark:to-primary-800
      dark:text-white
      dark:shadow-[0_4px_24px_0_rgba(6,182,212,0.18)]
    `,
    outline: `
      bg-transparent border-2 border-primary-500 text-primary-600
      hover:bg-primary-50 hover:text-primary-700
      dark:border-accent-500 dark:text-accent-300 dark:hover:bg-accent-900/20
    `,
    ghost: `
      bg-transparent text-primary-600 hover:bg-primary-50
      dark:text-accent-300 dark:hover:bg-accent-900/20
    `,
    danger: `
      bg-error text-white border-error hover:bg-error/90
      shadow-lg hover:shadow-red-500/25
    `
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-base gap-2 min-h-[44px]',
    lg: 'px-7 py-3 text-lg gap-2.5 min-h-[52px]',
    xl: 'px-9 py-4 text-xl gap-3 min-h-[60px]'
  };

  // Loading state adjustments
  const loadingClasses = loading ? 'cursor-wait' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${loadingClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Handle click events
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    if (loading || disabled) return;
    
    // Trigger click on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      case 'xl': return 'w-7 h-7';
      default: return 'w-5 h-5';
    }
  };

  // Loading spinner size
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      case 'xl': return 'xl';
      default: return 'md';
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...rest}
    >
      {/* Left Icon or Loading Spinner */}
      {loading ? (
        <LoadingSpinner 
          size={getSpinnerSize()} 
          className="animate-spin" 
        />
      ) : leftIcon ? (
        <span className={`${getIconSize()} flex-shrink-0`} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {/* Button Content */}
      {children && (
        <span className={loading ? 'opacity-70' : ''}>
          {children}
        </span>
      )}

      {/* Right Icon */}
      {!loading && rightIcon && (
        <span className={`${getIconSize()} flex-shrink-0`} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// Usage Examples for Documentation
const ButtonExamples = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      {/* States */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" loading>Loading Outline</Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Buttons with Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            leftIcon={<span>📧</span>}
          >
            Contact Us
          </Button>
          <Button 
            variant="secondary"
            rightIcon={<span>➜</span>}
          >
            Join Ministry
          </Button>
          <Button 
            variant="outline"
            leftIcon={<span>📅</span>}
            size="lg"
          >
            RSVP Event
          </Button>
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Full Width Button</h3>
        <Button fullWidth variant="primary" size="lg">
          Join Haven Word Church Family
        </Button>
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

export default Button;
export { ButtonExamples };