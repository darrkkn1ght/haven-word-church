import { STORAGE_KEYS } from '../utils/constants';

/**
 * Storage Service for Haven Word Church
 * Provides a unified interface for localStorage and sessionStorage operations
 * with error handling, data validation, and expiration support
 */

class StorageService {
  constructor() {
    this.prefix = 'hwc_'; // Haven Word Church prefix
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  /**
   * Check if storage is available in the browser
   * @returns {Object} Storage availability status
   */
  checkStorageAvailability() {
    const testKey = 'hwc_storage_test';
    const testValue = 'test';
    
    try {
      // Test localStorage
      localStorage.setItem(testKey, testValue);
      const localResult = localStorage.getItem(testKey) === testValue;
      localStorage.removeItem(testKey);

      // Test sessionStorage
      sessionStorage.setItem(testKey, testValue);
      const sessionResult = sessionStorage.getItem(testKey) === testValue;
      sessionStorage.removeItem(testKey);

      return {
        localStorage: localResult,
        sessionStorage: sessionResult
      };
    } catch (error) {
      console.warn('Storage availability check failed:', error);
      return {
        localStorage: false,
        sessionStorage: false
      };
    }
  }

  /**
   * Generate prefixed key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  getPrefixedKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Create storage item with metadata
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Object} Storage item with metadata
   */
  createStorageItem(value, options = {}) {
    const now = Date.now();
    const item = {
      value,
      timestamp: now,
      expires: options.expires ? now + options.expires : null,
      version: options.version || '1.0.0',
      type: typeof value,
      compressed: false
    };

    // Compress large strings (>1KB)
    if (typeof value === 'string' && value.length > 1024) {
      try {
        // Simple compression by removing extra whitespace
        item.value = value.replace(/\s+/g, ' ').trim();
        item.compressed = true;
      } catch (error) {
        console.warn('Failed to compress data:', error);
      }
    }

    return item;
  }

  /**
   * Parse stored item and handle expiration
   * @param {string} rawItem - Raw storage item
   * @returns {*} Parsed value or null if expired/invalid
   */
  parseStorageItem(rawItem) {
    try {
      const item = JSON.parse(rawItem);
      
      // Check expiration
      if (item.expires && Date.now() > item.expires) {
        return null;
      }

      // Return the actual value
      return item.value;
    } catch (error) {
      console.warn('Failed to parse storage item:', error);
      return null;
    }
  }

  // =============================================================================
  // LOCAL STORAGE METHODS
  // =============================================================================

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {boolean} Success status
   */
  setLocal(key, value, options = {}) {
    if (!this.isStorageAvailable.localStorage) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const storageItem = this.createStorageItem(value, options);
      localStorage.setItem(prefixedKey, JSON.stringify(storageItem));
      return true;
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.cleanupExpiredItems('local');
        // Try again after cleanup
        try {
          const prefixedKey = this.getPrefixedKey(key);
          const storageItem = this.createStorageItem(value, options);
          localStorage.setItem(prefixedKey, JSON.stringify(storageItem));
          return true;
        } catch (retryError) {
          console.error('Failed to set localStorage item after cleanup:', retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default value
   */
  getLocal(key, defaultValue = null) {
    if (!this.isStorageAvailable.localStorage) {
      return defaultValue;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const rawItem = localStorage.getItem(prefixedKey);
      
      if (rawItem === null) {
        return defaultValue;
      }

      const value = this.parseStorageItem(rawItem);
      
      // If item is expired or invalid, remove it and return default
      if (value === null) {
        localStorage.removeItem(prefixedKey);
        return defaultValue;
      }

      return value;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeLocal(key) {
    if (!this.isStorageAvailable.localStorage) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
      return false;
    }
  }

  // =============================================================================
  // SESSION STORAGE METHODS
  // =============================================================================

  /**
   * Set item in sessionStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {boolean} Success status
   */
  setSession(key, value, options = {}) {
    if (!this.isStorageAvailable.sessionStorage) {
      console.warn('sessionStorage is not available');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const storageItem = this.createStorageItem(value, options);
      sessionStorage.setItem(prefixedKey, JSON.stringify(storageItem));
      return true;
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.cleanupExpiredItems('session');
        // Try again after cleanup
        try {
          const prefixedKey = this.getPrefixedKey(key);
          const storageItem = this.createStorageItem(value, options);
          sessionStorage.setItem(prefixedKey, JSON.stringify(storageItem));
          return true;
        } catch (retryError) {
          console.error('Failed to set sessionStorage item after cleanup:', retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default value
   */
  getSession(key, defaultValue = null) {
    if (!this.isStorageAvailable.sessionStorage) {
      return defaultValue;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const rawItem = sessionStorage.getItem(prefixedKey);
      
      if (rawItem === null) {
        return defaultValue;
      }

      const value = this.parseStorageItem(rawItem);
      
      // If item is expired or invalid, remove it and return default
      if (value === null) {
        sessionStorage.removeItem(prefixedKey);
        return defaultValue;
      }

      return value;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeSession(key) {
    if (!this.isStorageAvailable.sessionStorage) {
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
      return false;
    }
  }

  // =============================================================================
  // UNIFIED STORAGE METHODS
  // =============================================================================

  /**
   * Set item with automatic storage selection
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {boolean} Success status
   */
  set(key, value, options = {}) {
    const { persist = false } = options;
    
    if (persist) {
      return this.setLocal(key, value, options);
    } else {
      return this.setSession(key, value, options);
    }
  }

  /**
   * Get item from both storages (localStorage first, then sessionStorage)
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default value
   */
  get(key, defaultValue = null) {
    // Try localStorage first
    const localValue = this.getLocal(key);
    if (localValue !== null) {
      return localValue;
    }

    // Try sessionStorage
    const sessionValue = this.getSession(key);
    if (sessionValue !== null) {
      return sessionValue;
    }

    return defaultValue;
  }

  /**
   * Remove item from both storages
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    const localSuccess = this.removeLocal(key);
    const sessionSuccess = this.removeSession(key);
    return localSuccess || sessionSuccess;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Clear all app-related items from storage
   * @param {string} storageType - 'local', 'session', or 'both'
   */
  clear(storageType = 'both') {
    const clearStorage = (storage) => {
      if (!storage) return;
      
      try {
        const keysToRemove = [];
        
        // Find all keys with our prefix
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }

        // Remove found keys
        keysToRemove.forEach(key => storage.removeItem(key));
      } catch (error) {
        console.error('Failed to clear storage:', error);
      }
    };

    if (storageType === 'local' || storageType === 'both') {
      clearStorage(localStorage);
    }
    
    if (storageType === 'session' || storageType === 'both') {
      clearStorage(sessionStorage);
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    const getStorageSize = (storage) => {
      if (!storage) return { total: 0, used: 0, items: 0 };
      
      let used = 0;
      let items = 0;
      
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const value = storage.getItem(key);
            used += key.length + (value ? value.length : 0);
            items++;
          }
        }
      } catch (error) {
        console.error('Failed to calculate storage size:', error);
      }

      return {
        used: used,
        items: items,
        usedMB: (used / 1024 / 1024).toFixed(2)
      };
    };

    return {
      localStorage: getStorageSize(localStorage),
      sessionStorage: getStorageSize(sessionStorage),
      available: this.isStorageAvailable
    };
  }

  /**
   * Clean up expired items from storage
   * @param {string} storageType - 'local', 'session', or 'both'
   * @returns {number} Number of items removed
   */
  cleanupExpiredItems(storageType = 'both') {
    let removedCount = 0;

    const cleanupStorage = (storage) => {
      if (!storage) return;
      
      try {
        const keysToRemove = [];
        const now = Date.now();
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            try {
              const rawItem = storage.getItem(key);
              if (rawItem) {
                const item = JSON.parse(rawItem);
                if (item.expires && now > item.expires) {
                  keysToRemove.push(key);
                }
              }
            } catch (parseError) {
              // Remove invalid items
              keysToRemove.push(key);
            }
          }
        }

        keysToRemove.forEach(key => {
          storage.removeItem(key);
          removedCount++;
        });
      } catch (error) {
        console.error('Failed to cleanup expired items:', error);
      }
    };

    if (storageType === 'local' || storageType === 'both') {
      cleanupStorage(localStorage);
    }
    
    if (storageType === 'session' || storageType === 'both') {
      cleanupStorage(sessionStorage);
    }

    return removedCount;
  }

  /**
   * Export storage data for backup
   * @param {string[]} keys - Specific keys to export (optional)
   * @returns {Object} Exported data
   */
  exportData(keys = null) {
    const exportStorage = (storage, storageType) => {
      const data = {};
      
      if (!storage) return data;
      
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const unprefixedKey = key.replace(this.prefix, '');
            
            // If specific keys are requested, check if this key is included
            if (keys && !keys.includes(unprefixedKey)) {
              continue;
            }
            
            const value = storage.getItem(key);
            if (value) {
              try {
                data[unprefixedKey] = JSON.parse(value);
              } catch (parseError) {
                data[unprefixedKey] = value;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to export ${storageType} data:`, error);
      }
      
      return data;
    };

    return {
      localStorage: exportStorage(localStorage, 'localStorage'),
      sessionStorage: exportStorage(sessionStorage, 'sessionStorage'),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import storage data from backup
   * @param {Object} data - Data to import
   * @param {Object} options - Import options
   * @returns {boolean} Success status
   */
  importData(data, options = {}) {
    const { overwrite = false, storageType = 'local' } = options;
    
    try {
      const importToStorage = (storageData, setMethod) => {
        if (!storageData) return;
        
        Object.entries(storageData).forEach(([key, item]) => {
          if (!overwrite && this.get(key) !== null) {
            return; // Skip existing items if not overwriting
          }
          
          // If it's a storage item with metadata, extract the value
          const value = item.value !== undefined ? item.value : item;
          const options = item.expires ? { expires: item.expires - Date.now() } : {};
          
          setMethod(key, value, options);
        });
      };

      if (storageType === 'local' && data.localStorage) {
        importToStorage(data.localStorage, this.setLocal.bind(this));
      }
      
      if (storageType === 'session' && data.sessionStorage) {
        importToStorage(data.sessionStorage, this.setSession.bind(this));
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // =============================================================================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // =============================================================================

  /**
   * Store user preferences
   * @param {Object} preferences - User preferences
   * @returns {boolean} Success status
   */
  setUserPreferences(preferences) {
    return this.setLocal(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preferences
   * @returns {Object} User preferences
   */
  getUserPreferences() {
    return this.getLocal(STORAGE_KEYS.USER_PREFERENCES, {});
  }

  /**
   * Store form data temporarily
   * @param {string} formId - Form identifier
   * @param {Object} formData - Form data to store
   * @returns {boolean} Success status
   */
  setFormData(formId, formData) {
    const key = `form_${formId}`;
    return this.setSession(key, formData, { expires: 30 * 60 * 1000 }); // 30 minutes
  }

  /**
   * Get stored form data
   * @param {string} formId - Form identifier
   * @returns {Object} Stored form data
   */
  getFormData(formId) {
    const key = `form_${formId}`;
    return this.getSession(key, {});
  }

  /**
   * Clear stored form data
   * @param {string} formId - Form identifier
   * @returns {boolean} Success status
   */
  clearFormData(formId) {
    const key = `form_${formId}`;
    return this.removeSession(key);
  }

  /**
   * Store recent searches
   * @param {string[]} searches - Array of search terms
   * @returns {boolean} Success status
   */
  setRecentSearches(searches) {
    const maxSearches = 10;
    const trimmedSearches = searches.slice(0, maxSearches);
    return this.setLocal(STORAGE_KEYS.RECENT_SEARCHES, trimmedSearches);
  }

  /**
   * Get recent searches
   * @returns {string[]} Array of recent search terms
   */
  getRecentSearches() {
    return this.getLocal(STORAGE_KEYS.RECENT_SEARCHES, []);
  }

  /**
   * Add a search term to recent searches
   * @param {string} searchTerm - Search term to add
   * @returns {boolean} Success status
   */
  addRecentSearch(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return false;
    }

    const searches = this.getRecentSearches();
    const trimmedTerm = searchTerm.trim().toLowerCase();
    
    // Remove existing occurrence
    const filtered = searches.filter(term => term.toLowerCase() !== trimmedTerm);
    
    // Add to beginning
    const updated = [searchTerm.trim(), ...filtered].slice(0, 10);
    
    return this.setRecentSearches(updated);
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;

// Minimal JWT decode (no validation, just base64 decode)
function decodeJWT(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function setToken(token) {
  return storageService.setLocal(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function getToken() {
  return storageService.getLocal(STORAGE_KEYS.AUTH_TOKEN, null);
}

export function removeToken() {
  return storageService.removeLocal(STORAGE_KEYS.AUTH_TOKEN);
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  // You can adjust this to match your backend's JWT payload
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}