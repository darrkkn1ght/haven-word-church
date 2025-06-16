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
    font-medium rounded-lg border
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98] hover:shadow-md
    ${fullWidth ? 'w-full' : ''}
  `.trim();

  // Variant styles with Nigerian church context
  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 
      text-white border-blue-600 hover:border-blue-700
      focus:ring-blue-500
      shadow-lg hover:shadow-blue-500/25
    `,
    secondary: `
      bg-green-600 hover:bg-green-700 
      text-white border-green-600 hover:border-green-700
      focus:ring-green-500
      shadow-lg hover:shadow-green-500/25
    `,
    outline: `
      bg-transparent hover:bg-blue-50 
      text-blue-600 hover:text-blue-700
      border-blue-600 hover:border-blue-700
      focus:ring-blue-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      text-gray-700 hover:text-gray-900
      border-transparent hover:border-gray-200
      focus:ring-gray-500
    `,
    danger: `
      bg-red-600 hover:bg-red-700 
      text-white border-red-600 hover:border-red-700
      focus:ring-red-500
      shadow-lg hover:shadow-red-500/25
    `
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
    md: 'px-4 py-2 text-base gap-2 min-h-[40px]',
    lg: 'px-6 py-3 text-lg gap-2.5 min-h-[48px]',
    xl: 'px-8 py-4 text-xl gap-3 min-h-[56px]'
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

export default Button;
export { ButtonExamples };