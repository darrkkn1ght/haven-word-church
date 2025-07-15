import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';

/**
 * useDrafts Hook
 * 
 * Comprehensive draft management for content creation
 * Supports auto-save, draft recovery, and draft management
 * 
 * @param {string} contentType - Type of content (blog, sermon, event, etc.)
 * @param {string} draftId - Unique identifier for the draft
 * @param {Object} options - Configuration options
 * @returns {Object} Draft management functions and state
 */
export const useDrafts = (contentType, draftId, options = {}) => {
  const {
    autoSaveInterval = 30000, // 30 seconds
    maxDrafts = 10,
    enableAutoSave = true,
    enableRecovery = true
  } = options;

  // State
  const [drafts, setDrafts] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);

  // Refs
  const autoSaveTimerRef = useRef(null);
  const lastContentRef = useRef(null);

  // Storage keys
  const draftsKey = `drafts_${contentType}`;
  const currentDraftKey = `draft_${contentType}_${draftId}`;
  const recoveryKey = `recovery_${contentType}_${draftId}`;

  /**
   * Load all drafts for this content type
   */
  const loadDrafts = useCallback(async () => {
    try {
      const savedDrafts = storageService.getLocal(draftsKey) || [];
      setDrafts(savedDrafts);
      
      // Check for recovery data
      if (enableRecovery) {
        const recoveryData = storageService.getSession(recoveryKey);
        if (recoveryData) {
          setRecoveryAvailable(true);
        }
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  }, [contentType, draftsKey, enableRecovery, recoveryKey]);

  /**
   * Save draft to storage
   */
  const saveDraft = useCallback(async (content, metadata = {}) => {
    try {
      setIsSaving(true);
      
      const draftData = {
        id: draftId,
        contentType,
        content,
        metadata: {
          ...metadata,
          lastModified: new Date().toISOString(),
          version: '1.0.0'
        },
        createdAt: metadata.createdAt || new Date().toISOString(),
        wordCount: typeof content === 'string' ? content.split(/\s+/).length : 0
      };

      // Save current draft
      storageService.setLocal(currentDraftKey, draftData, { expires: 30 * 24 * 60 * 60 * 1000 }); // 30 days
      setCurrentDraft(draftData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      lastContentRef.current = JSON.stringify(content);

      // Update drafts list
      const existingDrafts = storageService.getLocal(draftsKey) || [];
      const existingIndex = existingDrafts.findIndex(d => d.id === draftId);
      
      if (existingIndex >= 0) {
        existingDrafts[existingIndex] = draftData;
      } else {
        existingDrafts.unshift(draftData);
        // Keep only maxDrafts
        if (existingDrafts.length > maxDrafts) {
          existingDrafts.splice(maxDrafts);
        }
      }

      storageService.setLocal(draftsKey, existingDrafts, { expires: 30 * 24 * 60 * 60 * 1000 });
      setDrafts(existingDrafts);

      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [draftId, contentType, currentDraftKey, draftsKey, maxDrafts]);

  /**
   * Load specific draft
   */
  const loadDraft = useCallback(async (targetDraftId = draftId) => {
    try {
      const draftData = storageService.getLocal(`draft_${contentType}_${targetDraftId}`);
      if (draftData) {
        setCurrentDraft(draftData);
        setLastSaved(new Date(draftData.metadata.lastModified));
        setHasUnsavedChanges(false);
        lastContentRef.current = JSON.stringify(draftData.content);
        return draftData;
      }
      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, [draftId, contentType]);

  /**
   * Delete draft
   */
  const deleteDraft = useCallback(async (targetDraftId = draftId) => {
    try {
      // Remove from storage
      storageService.removeLocal(`draft_${contentType}_${targetDraftId}`);
      
      // Remove from drafts list
      const existingDrafts = storageService.getLocal(draftsKey) || [];
      const updatedDrafts = existingDrafts.filter(d => d.id !== targetDraftId);
      storageService.setLocal(draftsKey, updatedDrafts);
      setDrafts(updatedDrafts);

      // Clear current draft if it's the one being deleted
      if (targetDraftId === draftId) {
        setCurrentDraft(null);
        setLastSaved(null);
        setHasUnsavedChanges(false);
        lastContentRef.current = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }, [draftId, contentType, draftsKey]);

  /**
   * Auto-save functionality
   */
  const startAutoSave = useCallback((content, metadata = {}) => {
    if (!enableAutoSave) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      const contentString = JSON.stringify(content);
      if (contentString !== lastContentRef.current) {
        await saveDraft(content, metadata);
      }
    }, autoSaveInterval);
  }, [enableAutoSave, autoSaveInterval, saveDraft]);

  /**
   * Stop auto-save
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  /**
   * Check for unsaved changes
   */
  const checkUnsavedChanges = useCallback((content) => {
    const contentString = JSON.stringify(content);
    const hasChanges = contentString !== lastContentRef.current;
    setHasUnsavedChanges(hasChanges);
    return hasChanges;
  }, []);

  /**
   * Save recovery data
   */
  const saveRecoveryData = useCallback((content, metadata = {}) => {
    if (!enableRecovery) return;

    try {
      const recoveryData = {
        content,
        metadata: {
          ...metadata,
          savedAt: new Date().toISOString(),
          contentType
        }
      };
      
      storageService.setSession(recoveryKey, recoveryData, { expires: 24 * 60 * 60 * 1000 }); // 24 hours
    } catch (error) {
      console.error('Error saving recovery data:', error);
    }
  }, [enableRecovery, recoveryKey, contentType]);

  /**
   * Load recovery data
   */
  const loadRecoveryData = useCallback(() => {
    if (!enableRecovery) return null;

    try {
      const recoveryData = storageService.getSession(recoveryKey);
      if (recoveryData) {
        return recoveryData;
      }
      return null;
    } catch (error) {
      console.error('Error loading recovery data:', error);
      return null;
    }
  }, [enableRecovery, recoveryKey]);

  /**
   * Clear recovery data
   */
  const clearRecoveryData = useCallback(() => {
    if (!enableRecovery) return;

    try {
      storageService.removeSession(recoveryKey);
      setRecoveryAvailable(false);
    } catch (error) {
      console.error('Error clearing recovery data:', error);
    }
  }, [enableRecovery, recoveryKey]);

  /**
   * Export draft data
   */
  const exportDraft = useCallback((targetDraftId = draftId) => {
    try {
      const draftData = storageService.getLocal(`draft_${contentType}_${targetDraftId}`);
      if (draftData) {
        const blob = new Blob([JSON.stringify(draftData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contentType}_draft_${targetDraftId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exporting draft:', error);
      return false;
    }
  }, [draftId, contentType]);

  /**
   * Import draft data
   */
  const importDraft = useCallback(async (file) => {
    try {
      const text = await file.text();
      const draftData = JSON.parse(text);
      
      if (draftData.contentType === contentType) {
        await saveDraft(draftData.content, draftData.metadata);
        return true;
      } else {
        throw new Error('Invalid draft file type');
      }
    } catch (error) {
      console.error('Error importing draft:', error);
      return false;
    }
  }, [contentType, saveDraft]);

  /**
   * Get draft statistics
   */
  const getDraftStats = useCallback(() => {
    const totalDrafts = drafts.length;
    const totalWords = drafts.reduce((sum, draft) => sum + (draft.wordCount || 0), 0);
    const oldestDraft = drafts.length > 0 ? new Date(drafts[drafts.length - 1].createdAt) : null;
    const newestDraft = drafts.length > 0 ? new Date(drafts[0].createdAt) : null;

    return {
      totalDrafts,
      totalWords,
      oldestDraft,
      newestDraft,
      averageWords: totalDrafts > 0 ? Math.round(totalWords / totalDrafts) : 0
    };
  }, [drafts]);

  /**
   * Clean up expired drafts
   */
  const cleanupExpiredDrafts = useCallback(() => {
    try {
      const existingDrafts = storageService.getLocal(draftsKey) || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const validDrafts = existingDrafts.filter(draft => {
        const lastModified = new Date(draft.metadata.lastModified);
        return lastModified > thirtyDaysAgo;
      });

      if (validDrafts.length !== existingDrafts.length) {
        storageService.setLocal(draftsKey, validDrafts);
        setDrafts(validDrafts);
      }
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error);
    }
  }, [draftsKey]);

  // Initialize
  useEffect(() => {
    loadDrafts();
    cleanupExpiredDrafts();
  }, [loadDrafts, cleanupExpiredDrafts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    // State
    drafts,
    currentDraft,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    recoveryAvailable,
    
    // Core functions
    saveDraft,
    loadDraft,
    deleteDraft,
    
    // Auto-save functions
    startAutoSave,
    stopAutoSave,
    checkUnsavedChanges,
    
    // Recovery functions
    saveRecoveryData,
    loadRecoveryData,
    clearRecoveryData,
    
    // Import/Export functions
    exportDraft,
    importDraft,
    
    // Utility functions
    getDraftStats,
    cleanupExpiredDrafts,
    loadDrafts
  };
};

export default useDrafts; 