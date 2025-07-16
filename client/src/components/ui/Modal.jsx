import React, { useEffect, useRef, useCallback } from 'react';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

/**
 * Comprehensive Modal/Dialog Component for Haven Word Church
 * 
 * Features:
 * - Multiple sizes (sm, md, lg, xl, full)
 * - Customizable header, body, and footer
 * - Backdrop click to close (optional)
 * - ESC key to close
 * - Focus management and trapping
 * - Smooth animations
 * - Full accessibility (ARIA, keyboard navigation)
 * - Nigerian church context styling
 * - Portal rendering for proper z-index
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {'sm'|'md'|'lg'|'xl'|'full'} props.size - Modal size
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {boolean} props.showCloseButton - Show X close button in header
 * @param {boolean} props.closeOnBackdrop - Allow closing by clicking backdrop
 * @param {boolean} props.closeOnEscape - Allow closing with ESC key
 * @param {string} props.className - Additional CSS classes for modal content
 * @param {string} props.overlayClassName - Additional CSS classes for overlay
 * @param {boolean} props.showFooter - Whether to show default footer
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {Function} props.onConfirm - Confirm button handler
 * @param {Function} props.onCancel - Cancel button handler
 * @param {'primary'|'secondary'|'danger'} props.confirmVariant - Confirm button variant
 * @param {boolean} props.loading - Loading state for confirm button
 * @param {string} props.ariaLabel - Accessibility label
 * @param {string} props.ariaDescribedBy - Accessibility description reference
 */
const Modal = ({
  isOpen = false,
  onClose,
  size = 'md',
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  showFooter = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  ...rest
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  // const firstFocusableRef = useRef(null);
  // const lastFocusableRef = useRef(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  // Get focusable elements within modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(modalRef.current.querySelectorAll(focusableSelectors));
  }, []);

  // Handle escape key
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape && isOpen) {
      onClose?.();
    }
  }, [closeOnEscape, isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  }, [closeOnBackdrop, onClose]);

  // Handle tab key for focus trapping
  const handleTabKey = useCallback((e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  // Handle confirm action
  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    onCancel?.() || onClose?.();
  }, [onCancel, onClose]);

  // Effects for modal lifecycle
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Add event listeners
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleTabKey);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element after a short delay
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Remove event listeners
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleTabKey);
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscapeKey, handleTabKey, getFocusableElements]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        animate-in fade-in duration-200
        p-4
        ${overlayClassName}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-xl shadow-2xl
          w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-200
          flex flex-col
          ${className}
        `}
        tabIndex="-1"
        {...rest}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 pr-4">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="
                  ml-auto flex-shrink-0 p-2 -mr-2
                  text-gray-400 hover:text-gray-600
                  rounded-lg hover:bg-gray-100
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {(footer || showFooter) && (
          <div className="flex-shrink-0 border-t border-gray-200 p-6">
            {footer || (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                
                {onConfirm && (
                  <Button
                    variant={confirmVariant}
                    onClick={handleConfirm}
                    loading={loading}
                  >
                    {confirmText}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized Modal Components for Church Context
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, ...props }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={title || 'Confirm Action'}
    showFooter={true}
    size="sm"
    {...props}
  >
    <p className="text-gray-700">{message}</p>
  </Modal>
);

const AlertModal = ({ isOpen, onClose, title, message, type = 'info', ...props }) => {
  const typeStyles = {
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Notification'}
      size="sm"
      showCloseButton={false}
      {...props}
      footer={
        <div className="flex justify-center">
          <Button onClick={onClose}>
            OK
          </Button>
        </div>
      }
    >
      <div className={`p-4 rounded-lg border ${typeStyles[type]}`}>
        <div className="flex items-start">
          <span className="text-2xl mr-3 flex-shrink-0" aria-hidden="true">
            {typeIcons[type]}
          </span>
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

// Usage Examples for Documentation
const ModalExamples = () => {
  const [basicOpen, setBasicOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [largeOpen, setLargeOpen] = React.useState(false);

  return (
    <div className="space-y-8 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Modal Examples</h3>
      
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setBasicOpen(true)}>
          Basic Modal
        </Button>
        
        <Button 
          variant="secondary"
          onClick={() => setConfirmOpen(true)}
        >
          Confirmation Modal
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setAlertOpen(true)}
        >
          Alert Modal
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => setLargeOpen(true)}
        >
          Large Modal
        </Button>
      </div>

      {/* Basic Modal */}
      <Modal
        isOpen={basicOpen}
        onClose={() => setBasicOpen(false)}
        title="Welcome to Haven Word Church"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            We&apos;re delighted to have you join our church family! Haven Word Church 
            is a community where faith, hope, and love come together.
          </p>
          <p className="text-gray-700">
            Feel free to explore our ministries, upcoming events, and ways to 
            get involved in our church community.
          </p>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          alert('RSVP confirmed!');
          setConfirmOpen(false);
        }}
        title="Confirm RSVP"
        message="Are you sure you want to RSVP for the Sunday Service this week?"
        confirmText="Yes, RSVP"
        confirmVariant="secondary"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Success!"
        message="Your prayer request has been submitted successfully. Our prayer team will be praying for you."
        type="success"
      />

      {/* Large Modal */}
      <Modal
        isOpen={largeOpen}
        onClose={() => setLargeOpen(false)}
        title="Ministry Information"
        size="lg"
        showFooter={true}
        onConfirm={() => setLargeOpen(false)}
        confirmText="Join Ministry"
        cancelText="Maybe Later"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Youth Ministry</h4>
            <p className="text-gray-700 mb-4">
              Our Youth Ministry is designed to help young people grow in their 
              faith while building lasting friendships and developing leadership skills.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Weekly Activities</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Bible Study - Wednesdays 6PM</li>
                <li>• Youth Service - Sundays 5PM</li>
                <li>• Community Outreach - Saturdays</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Special Programs</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Annual Youth Camp</li>
                <li>• Leadership Training</li>
                <li>• Talent Development</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  showCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  showFooter: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmVariant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  loading: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error'])
};

export default Modal;
export { ConfirmationModal, AlertModal, ModalExamples };