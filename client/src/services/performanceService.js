/**
 * Performance Optimization Service
 * Handles various performance optimizations for the church website
 */

class PerformanceService {
  constructor() {
    this.observers = new Map();
    this.lazyImages = new Set();
    this.preloadedResources = new Set();
  }

  /**
   * Initialize performance optimizations
   */
  init() {
    this.setupIntersectionObserver();
    this.preloadCriticalResources();
    this.setupServiceWorker();
    this.optimizeImages();
    this.setupAnalytics();
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            this.imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
    }
  }

  /**
   * Load image when it comes into view
   */
  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      this.lazyImages.add(img);
    }
  }

  /**
   * Observe image for lazy loading
   */
  observeImage(img) {
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      '/logo.jpeg',
      '/assets/images/spreadcity-light.png',
      '/assets/images/spreadcity-dark.png'
    ];

    criticalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = resource;
        document.head.appendChild(link);
        this.preloadedResources.add(resource);
      }
    });
  }

  /**
   * Setup service worker for caching
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  /**
   * Optimize images with WebP support
   */
  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.observeImage(img);
    });
  }

  /**
   * Setup performance analytics
   */
  setupAnalytics() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logPerformanceMetric(entry);
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measurePageLoadPerformance();
      }, 0);
    });
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetric(entry) {
    const metric = {
      name: entry.name,
      value: entry.value,
      type: entry.entryType,
      timestamp: Date.now()
    };

    // Send to analytics service
    this.sendToAnalytics('performance', metric);
  }

  /**
   * Measure page load performance
   */
  measurePageLoadPerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.fetchStart
      };

      this.sendToAnalytics('pageLoad', metrics);
    }
  }

  /**
   * Send analytics data
   */
  sendToAnalytics(type, data) {
    // In a real implementation, this would send to Google Analytics, Mixpanel, etc.
    console.log(`Analytics - ${type}:`, data);
  }

  /**
   * Optimize bundle loading
   */
  optimizeBundleLoading() {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/static/css/critical.css';
    document.head.appendChild(criticalCSS);

    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      script.defer = true;
    });
  }

  /**
   * Optimize fonts loading
   */
  optimizeFonts() {
    // Preload critical fonts
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = font;
      document.head.appendChild(link);
    });
  }

  /**
   * Cache API responses
   */
  cacheApiResponse(url, data, ttl = 300000) { // 5 minutes default
    if ('caches' in window) {
      const cacheKey = `api-cache-${btoa(url)}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
  }

  /**
   * Get cached API response
   */
  getCachedApiResponse(url) {
    if ('caches' in window) {
      const cacheKey = `api-cache-${btoa(url)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheData.timestamp < cacheData.ttl) {
          return cacheData.data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    }
    
    return null;
  }

  /**
   * Optimize images with responsive sizes
   */
  getOptimizedImageUrl(url, width = 800) {
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }
    return url;
  }

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    
    this.observers.clear();
    this.lazyImages.clear();
  }
}

export default new PerformanceService(); 