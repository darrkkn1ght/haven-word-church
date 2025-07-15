import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Save, 
  FileText, 
  Clock, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  User
} from 'lucide-react';
import Button from '../ui/Button';
import useDrafts from '../../hooks/useDrafts';

/**
 * DraftManager Component
 * 
 * Comprehensive draft management interface for content creation
 * Provides save, load, recovery, and draft management functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.contentType - Type of content (blog, sermon, event, etc.)
 * @param {string} props.draftId - Unique identifier for the draft
 * @param {Object} props.content - Current content to save
 * @param {Object} props.metadata - Additional metadata to save with draft
 * @param {Function} props.onDraftLoad - Callback when draft is loaded
 * @param {Function} props.onDraftSave - Callback when draft is saved
 * @param {Object} props.options - Draft management options
 */
const DraftManager = ({
  contentType,
  draftId,
  content,
  metadata = {},
  onDraftLoad,
  onDraftSave,
  options = {}
}) => {
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);

  // Draft management hook
  const {
    drafts,
    currentDraft,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    recoveryAvailable,
    saveDraft,
    loadDraft,
    deleteDraft,
    startAutoSave,
    stopAutoSave,
    checkUnsavedChanges,
    loadRecoveryData,
    clearRecoveryData,
    exportDraft,
    importDraft,
    getDraftStats
  } = useDrafts(contentType, draftId, options);

  // Auto-save effect
  useEffect(() => {
    if (content && Object.keys(content).length > 0) {
      startAutoSave(content, metadata);
      setLastAutoSave(new Date());
    }
    
    return () => stopAutoSave();
  }, [content, metadata, startAutoSave, stopAutoSave]);

  // Check for unsaved changes
  useEffect(() => {
    checkUnsavedChanges(content);
  }, [content, checkUnsavedChanges]);

  // Recovery check on mount
  useEffect(() => {
    if (recoveryAvailable) {
      setShowRecoveryModal(true);
    }
  }, [recoveryAvailable]);

  /**
   * Handle manual save
   */
  const handleSave = async () => {
    const success = await saveDraft(content, metadata);
    if (success && onDraftSave) {
      onDraftSave(content, metadata);
    }
  };

  /**
   * Handle draft load
   */
  const handleLoadDraft = async (targetDraftId) => {
    const loadedDraft = await loadDraft(targetDraftId);
    if (loadedDraft && onDraftLoad) {
      onDraftLoad(loadedDraft.content, loadedDraft.metadata);
    }
    setShowDraftsList(false);
  };

  /**
   * Handle recovery load
   */
  const handleLoadRecovery = () => {
    const recoveryData = loadRecoveryData();
    if (recoveryData && onDraftLoad) {
      onDraftLoad(recoveryData.content, recoveryData.metadata);
    }
    clearRecoveryData();
    setShowRecoveryModal(false);
  };

  /**
   * Handle file import
   */
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const success = await importDraft(file);
      if (success) {
        e.target.value = '';
      }
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * Get draft stats
   */
  const stats = getDraftStats();

  return (
    <div className="relative">
      {/* Draft Status Bar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
        <div className="flex items-center space-x-4">
          {/* Save Status */}
          <div className="flex items-center space-x-2">
            {isSaving ? (
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Saved {formatDate(lastSaved)}</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Not saved</span>
              </div>
            )}
          </div>

          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <div className="flex items-center text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}

          {/* Auto-save indicator */}
          {lastAutoSave && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Auto-save: {formatDate(lastAutoSave)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Draft
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDraftsList(!showDraftsList)}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FileText className="w-4 h-4 mr-1" />
            Drafts ({drafts.length})
          </Button>

          {recoveryAvailable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecoveryModal(true)}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Recovery
            </Button>
          )}
        </div>
      </div>

      {/* Drafts List Dropdown */}
      {showDraftsList && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Saved Drafts
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDraftsList(false)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Draft Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalDrafts}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalWords}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.averageWords}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg Words</div>
              </div>
            </div>

            {/* Drafts List */}
            {drafts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No saved drafts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {draft.metadata.title || `Draft ${draft.id}`}
                        </span>
                        {draft.id === draftId && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{draft.wordCount || 0} words</span>
                        <span>{formatDate(draft.metadata.lastModified)}</span>
                        {draft.metadata.author && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {draft.metadata.author}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadDraft(draft.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportDraft(draft.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDraft(draft.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Import/Export Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="draft-import"
                />
                <label
                  htmlFor="draft-import"
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Import Draft
                </label>
                
                {currentDraft && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportDraft()}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export Current
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <RotateCcw className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recovery Available
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We found unsaved content from your previous session. Would you like to recover it?
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleLoadRecovery}
                className="flex-1"
              >
                Recover Content
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clearRecoveryData();
                  setShowRecoveryModal(false);
                }}
                className="flex-1"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DraftManager.propTypes = {
  contentType: PropTypes.string.isRequired,
  draftId: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  metadata: PropTypes.object,
  onDraftLoad: PropTypes.func,
  onDraftSave: PropTypes.func,
  options: PropTypes.object
};

export default DraftManager; 