import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';

/**
 * useBulkActions Hook
 * 
 * Comprehensive bulk actions management for content items
 * Handles selection, validation, and execution of bulk operations
 * 
 * @param {string} contentType - Type of content (blog, sermon, event, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} Bulk actions management functions and state
 */
export const useBulkActions = (contentType, options = {}) => {
  const {
    maxSelection = 100,
    enableProgressTracking = true,
    enableUndo = true,
    enableValidation = true,
    batchSize = 10
  } = options;

  // State
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [actionProgress, setActionProgress] = useState({});
  const [actionHistory, setActionHistory] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const abortControllerRef = useRef(null);

  // Storage keys
  const selectedItemsKey = `bulk_selected_${contentType}`;
  const actionHistoryKey = `bulk_history_${contentType}`;

  // Available bulk actions for different content types
  const availableActions = {
    blog: [
      { id: 'publish', label: 'Publish', icon: '📢', description: 'Publish selected blog posts' },
      { id: 'unpublish', label: 'Unpublish', icon: '📝', description: 'Unpublish selected blog posts' },
      { id: 'approve', label: 'Approve', icon: '✅', description: 'Approve selected blog posts' },
      { id: 'reject', label: 'Reject', icon: '❌', description: 'Reject selected blog posts' },
      { id: 'feature', label: 'Feature', icon: '⭐', description: 'Feature selected blog posts' },
      { id: 'unfeature', label: 'Unfeature', icon: '📄', description: 'Remove feature from selected blog posts' },
      { id: 'delete', label: 'Delete', icon: '🗑️', description: 'Delete selected blog posts', destructive: true },
      { id: 'archive', label: 'Archive', icon: '📦', description: 'Archive selected blog posts' },
      { id: 'change_category', label: 'Change Category', icon: '🏷️', description: 'Change category for selected blog posts' },
      { id: 'add_tags', label: 'Add Tags', icon: '🏷️', description: 'Add tags to selected blog posts' },
      { id: 'remove_tags', label: 'Remove Tags', icon: '🏷️', description: 'Remove tags from selected blog posts' }
    ],
    sermon: [
      { id: 'publish', label: 'Publish', icon: '📢', description: 'Publish selected sermons' },
      { id: 'unpublish', label: 'Unpublish', icon: '📝', description: 'Unpublish selected sermons' },
      { id: 'approve', label: 'Approve', icon: '✅', description: 'Approve selected sermons' },
      { id: 'reject', label: 'Reject', icon: '❌', description: 'Reject selected sermons' },
      { id: 'feature', label: 'Feature', icon: '⭐', description: 'Feature selected sermons' },
      { id: 'unfeature', label: 'Unfeature', icon: '📄', description: 'Remove feature from selected sermons' },
      { id: 'delete', label: 'Delete', icon: '🗑️', description: 'Delete selected sermons', destructive: true },
      { id: 'archive', label: 'Archive', icon: '📦', description: 'Archive selected sermons' },
      { id: 'change_category', label: 'Change Category', icon: '🏷️', description: 'Change category for selected sermons' },
      { id: 'add_tags', label: 'Add Tags', icon: '🏷️', description: 'Add tags to selected sermons' },
      { id: 'remove_tags', label: 'Remove Tags', icon: '🏷️', description: 'Remove tags from selected sermons' }
    ],
    event: [
      { id: 'publish', label: 'Publish', icon: '📢', description: 'Publish selected events' },
      { id: 'unpublish', label: 'Unpublish', icon: '📝', description: 'Unpublish selected events' },
      { id: 'cancel', label: 'Cancel', icon: '❌', description: 'Cancel selected events' },
      { id: 'postpone', label: 'Postpone', icon: '⏰', description: 'Postpone selected events' },
      { id: 'feature', label: 'Feature', icon: '⭐', description: 'Feature selected events' },
      { id: 'unfeature', label: 'Unfeature', icon: '📄', description: 'Remove feature from selected events' },
      { id: 'delete', label: 'Delete', icon: '🗑️', description: 'Delete selected events', destructive: true },
      { id: 'archive', label: 'Archive', icon: '📦', description: 'Archive selected events' },
      { id: 'change_category', label: 'Change Category', icon: '🏷️', description: 'Change category for selected events' },
      { id: 'change_location', label: 'Change Location', icon: '📍', description: 'Change location for selected events' }
    ],
    user: [
      { id: 'activate', label: 'Activate', icon: '✅', description: 'Activate selected users' },
      { id: 'deactivate', label: 'Deactivate', icon: '⏸️', description: 'Deactivate selected users' },
      { id: 'promote', label: 'Promote', icon: '⬆️', description: 'Promote selected users' },
      { id: 'demote', label: 'Demote', icon: '⬇️', description: 'Demote selected users' },
      { id: 'delete', label: 'Delete', icon: '🗑️', description: 'Delete selected users', destructive: true },
      { id: 'send_email', label: 'Send Email', icon: '📧', description: 'Send email to selected users' },
      { id: 'export', label: 'Export', icon: '📤', description: 'Export selected user data' }
    ]
  };

  /**
   * Load selected items from storage
   */
  const loadSelectedItems = useCallback(() => {
    try {
      const saved = storageService.getLocal(selectedItemsKey) || [];
      setSelectedItems(saved);
    } catch (error) {
      console.error('Error loading selected items:', error);
    }
  }, [selectedItemsKey]);

  /**
   * Save selected items to storage
   */
  const saveSelectedItems = useCallback((items) => {
    try {
      storageService.setLocal(selectedItemsKey, items);
      setSelectedItems(items);
    } catch (error) {
      console.error('Error saving selected items:', error);
    }
  }, [selectedItemsKey]);

  /**
   * Toggle item selection
   */
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(id => id !== itemId);
      } else {
        if (prev.length >= maxSelection) {
          return prev; // Don't exceed max selection
        }
        newSelection = [...prev, itemId];
      }
      
      saveSelectedItems(newSelection);
      return newSelection;
    });
  }, [maxSelection, saveSelectedItems]);

  /**
   * Select all items
   */
  const selectAll = useCallback((itemIds) => {
    const limitedSelection = itemIds.slice(0, maxSelection);
    saveSelectedItems(limitedSelection);
  }, [maxSelection, saveSelectedItems]);

  /**
   * Deselect all items
   */
  const deselectAll = useCallback(() => {
    saveSelectedItems([]);
  }, [saveSelectedItems]);

  /**
   * Toggle selection mode
   */
  const toggleSelectionMode = useCallback(() => {
    setIsSelecting(prev => !prev);
    if (isSelecting) {
      deselectAll();
    }
  }, [isSelecting, deselectAll]);

  /**
   * Validate bulk action
   */
  const validateBulkAction = useCallback((action, items, additionalData = {}) => {
    const errors = [];

    if (!action) {
      errors.push('No action selected');
    }

    if (!items || items.length === 0) {
      errors.push('No items selected');
    }

    if (items && items.length > maxSelection) {
      errors.push(`Cannot select more than ${maxSelection} items`);
    }

    // Action-specific validation
    if (action) {
      switch (action.id) {
        case 'change_category':
          if (!additionalData.category) {
            errors.push('Category is required');
          }
          break;
        case 'add_tags':
        case 'remove_tags':
          if (!additionalData.tags || additionalData.tags.length === 0) {
            errors.push('Tags are required');
          }
          break;
        case 'change_location':
          if (!additionalData.location) {
            errors.push('Location is required');
          }
          break;
        case 'send_email':
          if (!additionalData.subject || !additionalData.message) {
            errors.push('Email subject and message are required');
          }
          break;
        case 'promote':
        case 'demote':
          if (!additionalData.role) {
            errors.push('Role is required');
          }
          break;
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [maxSelection]);

  /**
   * Execute bulk action
   */
  const executeBulkAction = useCallback(async (action, additionalData = {}) => {
    if (!validateBulkAction(action, selectedItems, additionalData)) {
      return { success: false, errors: validationErrors };
    }

    setIsProcessing(true);
    setBulkAction(action);
    setActionProgress({ current: 0, total: selectedItems.length, status: 'processing' });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const results = {
        successful: [],
        failed: [],
        skipped: []
      };

      // Process items in batches
      for (let i = 0; i < selectedItems.length; i += batchSize) {
        const batch = selectedItems.slice(i, i + batchSize);
        
        // Check if operation was cancelled
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Operation cancelled');
        }

        // Process batch
        const batchPromises = batch.map(async (itemId) => {
          try {
            const response = await fetch(`/api/${contentType}/${itemId}/bulk-action`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                action: action.id,
                ...additionalData
              }),
              signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return { itemId, success: true, data: result.data };
          } catch (error) {
            return { itemId, success: false, error: error.message };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const itemResult = result.value;
            if (itemResult.success) {
              results.successful.push(itemResult);
            } else {
              results.failed.push(itemResult);
            }
          } else {
            results.failed.push({
              itemId: batch[index],
              success: false,
              error: result.reason?.message || 'Unknown error'
            });
          }
        });

        // Update progress
        setActionProgress(prev => ({
          ...prev,
          current: Math.min(i + batchSize, selectedItems.length),
          status: 'processing'
        }));

        // Add delay between batches to prevent overwhelming the server
        if (i + batchSize < selectedItems.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Record action in history
      const actionRecord = {
        id: `action_${Date.now()}`,
        action: action.id,
        contentType,
        itemCount: selectedItems.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        timestamp: new Date().toISOString(),
        additionalData
      };

      setActionHistory(prev => [actionRecord, ...prev.slice(0, 49)]); // Keep last 50 actions
      saveActionHistory([actionRecord, ...actionHistory.slice(0, 49)]);

      // Clear selection after successful action
      if (results.successful.length > 0) {
        deselectAll();
      }

      setActionProgress({ current: selectedItems.length, total: selectedItems.length, status: 'completed' });

      return {
        success: true,
        results,
        actionRecord
      };

    } catch (error) {
      setActionProgress({ current: 0, total: selectedItems.length, status: 'failed', error: error.message });
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
      setBulkAction(null);
    }
  }, [selectedItems, contentType, validateBulkAction, validationErrors, batchSize, actionHistory, deselectAll]);

  /**
   * Cancel bulk action
   */
  const cancelBulkAction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setBulkAction(null);
    setActionProgress({});
  }, []);

  /**
   * Undo last action
   */
  const undoLastAction = useCallback(async () => {
    if (!enableUndo || actionHistory.length === 0) {
      return { success: false, error: 'Undo not available' };
    }

    const lastAction = actionHistory[0];
    
    // Create reverse action
    const reverseAction = {
      id: `undo_${lastAction.action}`,
      label: `Undo ${lastAction.action}`,
      icon: '↩️',
      description: `Undo ${lastAction.action} action`
    };

    // Execute reverse action
    return await executeBulkAction(reverseAction, lastAction.additionalData);
  }, [enableUndo, actionHistory, executeBulkAction]);

  /**
   * Save action history
   */
  const saveActionHistory = useCallback((history) => {
    try {
      storageService.setLocal(actionHistoryKey, history);
      setActionHistory(history);
    } catch (error) {
      console.error('Error saving action history:', error);
    }
  }, [actionHistoryKey]);

  /**
   * Clear action history
   */
  const clearActionHistory = useCallback(() => {
    try {
      storageService.removeLocal(actionHistoryKey);
      setActionHistory([]);
    } catch (error) {
      console.error('Error clearing action history:', error);
    }
  }, [actionHistoryKey]);

  /**
   * Get action statistics
   */
  const getActionStats = useCallback(() => {
    const stats = {
      totalActions: actionHistory.length,
      successfulActions: actionHistory.filter(a => a.successful > 0).length,
      totalItemsProcessed: actionHistory.reduce((sum, a) => sum + a.itemCount, 0),
      totalSuccessful: actionHistory.reduce((sum, a) => sum + a.successful, 0),
      totalFailed: actionHistory.reduce((sum, a) => sum + a.failed, 0),
      byAction: {}
    };

    // Count by action type
    actionHistory.forEach(action => {
      if (!stats.byAction[action.action]) {
        stats.byAction[action.action] = {
          count: 0,
          totalItems: 0,
          successful: 0,
          failed: 0
        };
      }
      stats.byAction[action.action].count++;
      stats.byAction[action.action].totalItems += action.itemCount;
      stats.byAction[action.action].successful += action.successful;
      stats.byAction[action.action].failed += action.failed;
    });

    return stats;
  }, [actionHistory]);

  // Initialize on mount
  useEffect(() => {
    loadSelectedItems();
    const savedHistory = storageService.getLocal(actionHistoryKey) || [];
    setActionHistory(savedHistory);
  }, [loadSelectedItems, actionHistoryKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    selectedItems,
    isSelecting,
    bulkAction,
    actionProgress,
    actionHistory,
    validationErrors,
    isProcessing,

    // Selection functions
    toggleItemSelection,
    selectAll,
    deselectAll,
    toggleSelectionMode,

    // Action functions
    executeBulkAction,
    cancelBulkAction,
    undoLastAction,
    validateBulkAction,

    // History functions
    clearActionHistory,
    getActionStats,

    // Configuration
    availableActions: availableActions[contentType] || [],
    maxSelection,
    enableProgressTracking,
    enableUndo
  };
};

export default useBulkActions; 