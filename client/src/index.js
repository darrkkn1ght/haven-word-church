import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWithHelmetProvider from './AppWithHelmetProvider';
import App from './App';

// Import global styles first
import './styles/globals.css';
import './index.css';

// Performance monitoring and error reporting (optional)
import { reportWebVitals } from './utils/reportWebVitals';

/**
 * Haven Word Church - React Application Entry Point
 * 
 * This file initializes the React application and renders it to the DOM.
 * It includes performance monitoring, error handling, and development tools.
 * 
 * Features:
 * - React 18 createRoot API for concurrent features
 * - StrictMode for development error detection
 * - Performance monitoring with Web Vitals
 * - Service Worker support for offline functionality
 * - Development environment detection
 * - Error boundary for unhandled React errors
 */

/**
 * Initialize the React application
 */
const initializeApp = () => {
  // Get the root DOM element
  const container = document.getElementById('root');
  
  if (!container) {
    throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.');
  }

  // Create React root using the new React 18 createRoot API
  const root = createRoot(container);

  // Render the application with HelmetProvider
  root.render(
    <React.StrictMode>
      <AppWithHelmetProvider>
        <App />
      </AppWithHelmetProvider>
    </React.StrictMode>
  );

  return root;
};

/**
 * Set up performance monitoring
 * Tracks Core Web Vitals and other performance metrics
 */
const setupPerformanceMonitoring = () => {
  // Report web vitals in production for performance monitoring
  if (process.env.NODE_ENV === 'production') {
    reportWebVitals((metric) => {
      // Send to analytics service (Google Analytics, etc.)
      console.log('Web Vital:', metric);
      
      // Example: Send to Google Analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    });
  }
};

/**
 * Set up service worker for offline functionality and caching
 */
const setupServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available; show update notification
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

/**
 * Show update notification when new version is available
 */
const showUpdateNotification = () => {
  // Create a simple notification for app updates
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #003DA5;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      max-width: 300px;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div>
          <strong>Update Available</strong>
          <p style="margin: 4px 0 8px 0; font-size: 14px; opacity: 0.9;">
            A new version of Haven Word Church website is available.
          </p>
          <button onclick="window.location.reload()" style="
            background: #FF6A13;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
          ">
            Refresh Now
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            margin-left: 8px;
          ">
            Later
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds if user doesn't interact
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
};

/**
 * Set up global error handling for uncaught errors
 */
const setupGlobalErrorHandling = () => {
  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureError(event.error);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the error from being logged to console twice
    event.preventDefault();
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureError(event.reason);
    }
  });
};

/**
 * Set up development tools and debugging
 */
const setupDevelopmentTools = () => {
  if (process.env.NODE_ENV === 'development') {
    // Add development-specific debugging tools
    window.__HAVEN_WORD_DEBUG__ = {
      version: process.env.REACT_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL,
      features: {
        auth: true,
        payments: process.env.REACT_APP_ENABLE_PAYMENTS === 'true',
        notifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
        analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
      }
    };
    
    console.log('🏛️ Haven Word Church App - Development Mode');
    console.log('Debug info available at window.__HAVEN_WORD_DEBUG__');
  }
};

/**
 * Set up accessibility enhancements
 */
const setupAccessibility = () => {
  // Add skip link for keyboard navigation
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #003DA5;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10001;
    font-weight: 500;
    transition: top 0.3s;
  `;
  
  // Show skip link on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Set up focus management for single-page app

  // Manage focus on route changes (will be triggered by router)
  window.addEventListener('routechange', () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  });
};

/**
 * Initialize Church-specific features
 */
const setupChurchFeatures = () => {
  // Set up Nigerian time zone detection
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.documentElement.setAttribute('data-timezone', timezone);
  
  // Set up church branding in document
  document.title = 'Haven Word Church - Ibadan, Nigeria';
  
  // Add church-specific meta tags
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Haven Word Church in Ibadan, Nigeria - Join us for worship, fellowship, and spiritual growth. Experience God\'s love in our welcoming community.';
    document.head.appendChild(meta);
  }
  
  // Add Open Graph tags for social sharing
  const ogTags = [
    { property: 'og:title', content: 'Haven Word Church - Ibadan, Nigeria' },
    { property: 'og:description', content: 'Join us for worship, fellowship, and spiritual growth.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'en_NG' }
  ];
  
  ogTags.forEach(tag => {
    const existingTag = document.querySelector(`meta[property="${tag.property}"]`);
    if (!existingTag) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      document.head.appendChild(meta);
    }
  });
};

/**
 * Main initialization function
 */
const init = async () => {
  try {
    // Set up all systems
    setupGlobalErrorHandling();
    setupDevelopmentTools();
    setupAccessibility();
    setupChurchFeatures();
    setupServiceWorker();
    setupPerformanceMonitoring();
    
    // Initialize the React app
    const root = initializeApp();
    
    // Log successful initialization
    console.log('🏛️ Haven Word Church application initialized successfully');
    
    return root;
  } catch (error) {
    console.error('Failed to initialize Haven Word Church application:', error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, #003DA5 0%, #002B7A 100%);
        color: white;
        text-align: center;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 40px;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        ">
          <h1 style="font-size: 24px; margin-bottom: 16px; font-weight: 600;">
            Haven Word Church
          </h1>
          <p style="margin-bottom: 20px; opacity: 0.9; line-height: 1.6;">
            We're experiencing technical difficulties. Please refresh the page or try again later.
          </p>
          <button onclick="window.location.reload()" style="
            background: #FF6A13;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
          ">
            Refresh Page
          </button>
        </div>
      </div>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(errorMessage);
    
    throw error;
  }
};

// Initialize the application
init().catch(error => {
  console.error('Critical error during app initialization:', error);
});

// Hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App component...');
  });
}