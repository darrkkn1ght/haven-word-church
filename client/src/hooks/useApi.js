import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for API operations with built-in loading, error handling, and caching
 * Provides a clean interface for making HTTP requests
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableCache - Enable response caching (default: false)
 * @param {number} options.cacheTimeout - Cache timeout in milliseconds (default: 5 minutes)
 * @param {boolean} options.retryOnFailure - Retry failed requests (default: true)
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns {Object} API state and operations
 */
export const useApi = (options = {}) => {
  const {
    enableCache = false,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    retryOnFailure = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Cache and request management
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const requestCountRef = useRef(0);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Get cached data if available and not expired
   */
  const getCachedData = useCallback((key) => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cacheTimeout;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [enableCache, cacheTimeout]);

  /**
   * Set cached data
   */
  const setCachedData = useCallback((key, data) => {
    if (!enableCache) return;
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [enableCache]);

  /**
   * Generate cache key from URL and params
   */
  const generateCacheKey = useCallback((url, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }, []);

  /**
   * Sleep utility for retry delays
   */
  const sleep = useCallback((ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  /**
   * Handle API errors with proper error classification
   */
  const handleApiError = useCallback((error, attempt = 1) => {
    const errorInfo = {
      message: 'An unexpected error occurred',
      status: null,
      isNetworkError: false,
      isServerError: false,
      isRetryable: false,
      originalError: error
    };

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      errorInfo.status = status;
      errorInfo.message = data?.message || data?.error || `Server error (${status})`;
      if (status >= 500) {
        errorInfo.isServerError = true;
        errorInfo.isRetryable = attempt < maxRetries;
        errorInfo.message = 'Server error. Please try again later.';
      } else if (status === 429) {
        errorInfo.isRetryable = attempt < maxRetries;
        errorInfo.message = 'Too many requests. Please wait and try again.';
      }
    } else if (error.request) {
      // Network error
      errorInfo.isNetworkError = true;
      errorInfo.isRetryable = attempt < maxRetries;
      errorInfo.message = 'Network error. Please check your connection and try again.';
    } else {
      // Request setup error
      errorInfo.message = error.message || 'Request failed';
    }

    return errorInfo;
  }, [maxRetries]);

  /**
   * Make API request with retry logic
   */
  const makeRequest = useCallback(async (requestFn, attempt = 1) => {
    try {
      const response = await requestFn();
      return { success: true, data: response.data };
    } catch (error) {
      const errorInfo = handleApiError(error, attempt);
      if (retryOnFailure && errorInfo.isRetryable && attempt < maxRetries) {
        await sleep(retryDelay * attempt); // Exponential backoff
        return makeRequest(requestFn, attempt + 1);
      }
      return { success: false, error: errorInfo };
    }
  }, [handleApiError, retryOnFailure, maxRetries, retryDelay, sleep]);

  /**
   * Generic request executor
   */
  const executeRequest = useCallback(async (
    requestFn,
    {
      useCache = enableCache,
      cacheKey = null,
      onSuccess = null,
      onError = null,
      updateState = true
    } = {}
  ) => {
    const requestId = ++requestCountRef.current;
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      // Check cache if enabled
      if (useCache && cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          if (updateState) {
            setData(cachedData);
            setError(null);
            setLoading(false);
          }
          return { success: true, data: cachedData, fromCache: true };
        }
      }
      if (updateState) {
        setLoading(true);
        setError(null);
      }
      const result = await makeRequest(() => 
        requestFn(abortControllerRef.current.signal)
      );
      // Check if this is still the latest request
      if (requestId !== requestCountRef.current) {
        return { success: false, error: { message: 'Request cancelled' } };
      }
      if (result.success) {
        // Cache successful response
        if (useCache && cacheKey) {
          setCachedData(cacheKey, result.data);
        }
        if (updateState) {
          setData(result.data);
          setError(null);
        }
        if (onSuccess) {
          onSuccess(result.data);
        }
        return { success: true, data: result.data, fromCache: false };
      } else {
        if (updateState) {
          setError(result.error);
          setData(null);
        }
        if (onError) {
          onError(result.error);
        }
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      if (updateState) {
        setError(errorInfo);
        setData(null);
      }
      if (onError) {
        onError(errorInfo);
      }
      return { success: false, error: errorInfo };
    } finally {
      if (updateState && requestId === requestCountRef.current) {
        setLoading(false);
      }
      // Clear abort controller if this was the latest request
      if (requestId === requestCountRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [
    enableCache,
    getCachedData,
    setCachedData,
    makeRequest,
    handleApiError
  ]);

  /**
   * GET request
   */
  const get = useCallback(async (url, params = {}, options = {}) => {
    const cacheKey = generateCacheKey(url, params);
    return executeRequest(
      (signal) => api.get(url, { params, signal }),
      { ...options, cacheKey }
    );
  }, [executeRequest, generateCacheKey]);

  /**
   * POST request
   */
  const post = useCallback(async (url, data = {}, options = {}) => {
    return executeRequest(
      (signal) => api.post(url, data, { signal }),
      { useCache: false, ...options }
    );
  }, [executeRequest]);

  /**
   * PUT request
   */
  const put = useCallback(async (url, data = {}, options = {}) => {
    return executeRequest(
      (signal) => api.put(url, data, { signal }),
      { useCache: false, ...options }
    );
  }, [executeRequest]);

  /**
   * PATCH request
   */
  const patch = useCallback(async (url, data = {}, options = {}) => {
    return executeRequest(
      (signal) => api.patch(url, data, { signal }),
      { useCache: false, ...options }
    );
  }, [executeRequest]);

  /**
   * DELETE request
   */
  const del = useCallback(async (url, options = {}) => {
    return executeRequest(
      (signal) => api.delete(url, { signal }),
      { useCache: false, ...options }
    );
  }, [executeRequest]);

  /**
   * Upload file with progress tracking
   */
  const upload = useCallback(async (url, file, options = {}) => {
    const {
      onProgress = null,
      additionalData = {},
      ...requestOptions
    } = options;
    const formData = new FormData();
    formData.append('file', file);
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    return executeRequest(
      (signal) => api.post(url, formData, {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        } : undefined,
      }),
      { useCache: false, ...requestOptions }
    );
  }, [executeRequest]);

  /**
   * Cancel current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    cancelRequest();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cancelRequest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    // State
    loading,
    error,
    data,
    // HTTP methods
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    // Utilities
    cancelRequest,
    reset,
    clearCache,
    // Status helpers
    isLoading: loading,
    hasError: !!error,
    hasData: !!data,
    // Error helpers
    isNetworkError: error?.isNetworkError || false,
    isServerError: error?.isServerError || false,
    // Advanced usage
    executeRequest // For custom request patterns
  };
};

/**
 * Simplified hook for single API calls without state management
 */
export const useApiCall = () => {
  const { executeRequest } = useApi();
  return {
    get: (url, params, options) => 
      executeRequest(
        (signal) => api.get(url, { params, signal }),
        { updateState: false, ...options }
      ),
    post: (url, data, options) => 
      executeRequest(
        (signal) => api.post(url, data, { signal }),
        { updateState: false, useCache: false, ...options }
      ),
    put: (url, data, options) => 
      executeRequest(
        (signal) => api.put(url, data, { signal }),
        { updateState: false, useCache: false, ...options }
      ),
    patch: (url, data, options) => 
      executeRequest(
        (signal) => api.patch(url, data, { signal }),
        { updateState: false, useCache: false, ...options }
      ),
    delete: (url, options) => 
      executeRequest(
        (signal) => api.delete(url, { signal }),
        { updateState: false, useCache: false, ...options }
      )
  };
};

export default useApi;
