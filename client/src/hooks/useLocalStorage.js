import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';

/**
 * Custom hook for managing localStorage with React state synchronization
 * Provides automatic JSON serialization, error handling, and cross-tab synchronization
 * 
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @param {Object} options - Configuration options
 * @param {boolean} options.serialize - Enable JSON serialization (default: true)
 * @param {boolean} options.syncAcrossTabs - Enable cross-tab synchronization (default: true)
 * @param {Function} options.validator - Function to validate stored values
 * @param {Function} options.onError - Error callback function
 * @param {boolean} options.encrypted - Enable encryption via storageService (default: false)
 * @returns {Array} [value, setValue, removeValue, { loading, error, isSupported }]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = true,
    syncAcrossTabs = true,
    validator = null,
    onError = null,
    encrypted = false
  } = options;

  // Refs for managing state
  const keyRef = useRef(key);
  const initialValueRef = useRef(initialValue);
  const optionsRef = useRef(options);
  
  // State management
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  /**
   * Check if localStorage is available
   */
  const checkLocalStorageSupport = useCallback(() => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Safely parse stored value
   */
  const parseStoredValue = useCallback((value) => {
    if (!serialize) return value;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Failed to parse localStorage value for key "${key}":`, e);
      return value; // Return raw value if parsing fails
    }
  }, [serialize, key]);

  /**
   * Safely stringify value for storage
   */
  const stringifyValue = useCallback((value) => {
    if (!serialize) return value;
    
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.warn(`Failed to stringify value for localStorage key "${key}":`, e);
      return String(value); // Fallback to string conversion
    }
  }, [serialize, key]);

  /**
   * Validate value using provided validator
   */
  const validateValue = useCallback((value) => {
    if (!validator) return true;
    
    try {
      return validator(value);
    } catch (e) {
      console.warn(`Validator failed for localStorage key "${key}":`, e);
      return false;
    }
  }, [validator, key]);

  /**
   * Handle errors consistently
   */
  const handleError = useCallback((error, context = '') => {
    const errorMessage = `localStorage error${context ? ` (${context})` : ''}: ${error.message}`;
    setError(errorMessage);
    
    if (onError) {
      onError(error, context);
    }
    
    console.error(errorMessage, error);
  }, [onError]);

  /**
   * Read value from localStorage
   */
  const readValue = useCallback(() => {
    if (!isSupported) {
      return initialValueRef.current;
    }

    try {
      let item;
      
      if (encrypted) {
        // Use storageService for encrypted storage
        item = storageService.getItem(key);
      } else {
        // Use regular localStorage
        item = localStorage.getItem(key);
      }

      if (item === null) {
        return initialValueRef.current;
      }

      const parsedValue = encrypted ? item : parseStoredValue(item);
      
      // Validate the value if validator is provided
      if (!validateValue(parsedValue)) {
        console.warn(`Invalid value found in localStorage for key "${key}", using initial value`);
        return initialValueRef.current;
      }

      return parsedValue;
    } catch (error) {
      handleError(error, 'reading');
      return initialValueRef.current;
    }
  }, [key, encrypted, parseStoredValue, validateValue, handleError, isSupported]);

  /**
   * Write value to localStorage
   */
  const writeValue = useCallback((value) => {
    if (!isSupported) {
      return false;
    }

    try {
      // Validate the value before storing
      if (!validateValue(value)) {
        throw new Error('Value failed validation');
      }

      if (encrypted) {
        // Use storageService for encrypted storage
        storageService.setItem(key, value);
      } else {
        // Use regular localStorage
        const stringifiedValue = stringifyValue(value);
        localStorage.setItem(key, stringifiedValue);
      }

      return true;
    } catch (error) {
      handleError(error, 'writing');
      return false;
    }
  }, [key, encrypted, stringifyValue, validateValue, handleError, isSupported]);

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    if (!isSupported) {
      return false;
    }

    try {
      if (encrypted) {
        storageService.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      handleError(error, 'removing');
      return false;
    }
  }, [key, encrypted, handleError, isSupported]);

  /**
   * Set value with state synchronization
   */
  const setValue = useCallback((value) => {
    try {
      setError(null);
      
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state
      setStoredValue(valueToStore);
      
      // Write to localStorage
      writeValue(valueToStore);
      
      return true;
    } catch (error) {
      handleError(error, 'setting value');
      return false;
    }
  }, [storedValue, writeValue, handleError]);

  /**
   * Remove value and reset to initial value
   */
  const removeStoredValue = useCallback(() => {
    try {
      setError(null);
      
      // Remove from localStorage
      const success = removeValue();
      
      if (success) {
        // Reset to initial value
        setStoredValue(initialValueRef.current);
      }
      
      return success;
    } catch (error) {
      handleError(error, 'removing value');
      return false;
    }
  }, [removeValue, handleError]);

  /**
   * Refresh value from localStorage (useful for cross-tab sync)
   */
  const refreshValue = useCallback(() => {
    try {
      setError(null);
      const currentValue = readValue();
      setStoredValue(currentValue);
      return currentValue;
    } catch (error) {
      handleError(error, 'refreshing value');
      return storedValue;
    }
  }, [readValue, handleError, storedValue]);

  /**
   * Handle storage events for cross-tab synchronization
   */
  const handleStorageChange = useCallback((e) => {
    if (e.key === key && e.storageArea === localStorage) {
      try {
        const newValue = e.newValue === null 
          ? initialValueRef.current 
          : parseStoredValue(e.newValue);
        
        if (validateValue(newValue)) {
          setStoredValue(newValue);
        }
      } catch (error) {
        handleError(error, 'handling storage change');
      }
    }
  }, [key, parseStoredValue, validateValue, handleError]);

  /**
   * Initialize localStorage support and load initial value
   */
  useEffect(() => {
    const supported = checkLocalStorageSupport();
    setIsSupported(supported);
    
    if (supported) {
      const value = readValue();
      setStoredValue(value);
    }
    
    setLoading(false);
  }, [checkLocalStorageSupport, readValue]);

  /**
   * Set up cross-tab synchronization
   */
  useEffect(() => {
    if (!syncAcrossTabs || !isSupported) return;

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncAcrossTabs, isSupported, handleStorageChange]);

  /**
   * Update refs when props change
   */
  useEffect(() => {
    keyRef.current = key;
    initialValueRef.current = initialValue;
    optionsRef.current = options;
  }, [key, initialValue, options]);

  /**
   * Clear error when key changes
   */
  useEffect(() => {
    setError(null);
  }, [key]);

  return [
    storedValue,
    setValue,
    removeStoredValue,
    {
      loading,
      error,
      isSupported,
      refreshValue,
      clearError: () => setError(null)
    }
  ];
};

/**
 * Simplified hook for session storage
 * Uses the same API as useLocalStorage but with sessionStorage
 */
export const useSessionStorage = (key, initialValue, options = {}) => {
  const {
    serialize = true,
    validator = null,
    onError = null
  } = options;

  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const checkSessionStorageSupport = useCallback(() => {
    try {
      const testKey = '__sessionStorage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const parseStoredValue = useCallback((value) => {
    if (!serialize) return value;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Failed to parse sessionStorage value for key "${key}":`, e);
      return value;
    }
  }, [serialize, key]);

  const stringifyValue = useCallback((value) => {
    if (!serialize) return value;
    
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.warn(`Failed to stringify value for sessionStorage key "${key}":`, e);
      return String(value);
    }
  }, [serialize, key]);

  const handleError = useCallback((error, context = '') => {
    const errorMessage = `sessionStorage error${context ? ` (${context})` : ''}: ${error.message}`;
    setError(errorMessage);
    
    if (onError) {
      onError(error, context);
    }
    
    console.error(errorMessage, error);
  }, [onError]);

  const readValue = useCallback(() => {
    if (!isSupported) {
      return initialValue;
    }

    try {
      const item = sessionStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      const parsedValue = parseStoredValue(item);
      
      if (validator && !validator(parsedValue)) {
        console.warn(`Invalid value found in sessionStorage for key "${key}", using initial value`);
        return initialValue;
      }

      return parsedValue;
    } catch (error) {
      handleError(error, 'reading');
      return initialValue;
    }
  }, [key, parseStoredValue, validator, handleError, isSupported, initialValue]);

  const setValue = useCallback((value) => {
    try {
      setError(null);
      
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      if (validator && !validator(valueToStore)) {
        throw new Error('Value failed validation');
      }
      
      setStoredValue(valueToStore);
      
      if (isSupported) {
        const stringifiedValue = stringifyValue(valueToStore);
        sessionStorage.setItem(key, stringifiedValue);
      }
      
      return true;
    } catch (error) {
      handleError(error, 'setting value');
      return false;
    }
  }, [storedValue, key, stringifyValue, validator, handleError, isSupported]);

  const removeStoredValue = useCallback(() => {
    try {
      setError(null);
      
      if (isSupported) {
        sessionStorage.removeItem(key);
      }
      
      setStoredValue(initialValue);
      return true;
    } catch (error) {
      handleError(error, 'removing value');
      return false;
    }
  }, [key, initialValue, handleError, isSupported]);

  useEffect(() => {
    const supported = checkSessionStorageSupport();
    setIsSupported(supported);
    
    if (supported) {
      const value = readValue();
      setStoredValue(value);
    }
    
    setLoading(false);
  }, [checkSessionStorageSupport, readValue]);

  useEffect(() => {
    setError(null);
  }, [key]);

  return [
    storedValue,
    setValue,
    removeStoredValue,
    {
      loading,
      error,
      isSupported,
      clearError: () => setError(null)
    }
  ];
};

/**
 * Hook for managing multiple localStorage keys as a single object
 * Useful for user preferences, settings, etc.
 */
export const useLocalStorageState = (keys, initialValues = {}) => {
  const [state, setState] = useState(initialValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateValue = useCallback((key, value) => {
    try {
      const newState = { ...state, [key]: value };
      setState(newState);
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      setError(`Failed to update ${key}: ${error.message}`);
      return false;
    }
  }, [state]);

  const removeValue = useCallback((key) => {
    try {
      const newState = { ...state };
      delete newState[key];
      setState(newState);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      setError(`Failed to remove ${key}: ${error.message}`);
      return false;
    }
  }, [state]);

  const clearAll = useCallback(() => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
      setState(initialValues);
      return true;
    } catch (error) {
      setError(`Failed to clear all: ${error.message}`);
      return false;
    }
  }, [keys, initialValues]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const loadedState = { ...initialValues };
        
        for (const key of keys) {
          try {
            const item = localStorage.getItem(key);
            if (item !== null) {
              loadedState[key] = JSON.parse(item);
            }
          } catch (e) {
            console.warn(`Failed to load ${key} from localStorage:`, e);
          }
        }
        
        setState(loadedState);
      } catch (error) {
        setError(`Failed to load state: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [keys, initialValues]);

  return {
    state,
    updateValue,
    removeValue,
    clearAll,
    loading,
    error,
    clearError: () => setError(null)
  };
};

export default useLocalStorage;