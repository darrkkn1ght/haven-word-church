import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  CheckSquare, 
  Square, 
  X,
  AlertTriangle,
  Clock,
  History,
  Undo,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../ui/Button';
import useBulkActions from '../../hooks/useBulkActions';

/**
 * BulkActionsPanel Component
 * 
 * Comprehensive bulk actions interface for content management
 * Provides selection, validation, and execution of bulk operations
 * 
 * @param {Object} props - Component props
 * @param {string} props.contentType - Type of content (blog, sermon, event, etc.)
 * @param {Array} props.items - Available items for selection
 * @param {Function} props.onActionComplete - Callback when action is completed
 * @param {Object} props.options - Component options
 */
const BulkActionsPanel = ({
  contentType,
  items = [],
  onActionComplete,
  options = {}
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionData, setActionData] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Bulk actions hook
  const {
    selectedItems,
    isSelecting,
    bulkAction,
    actionProgress,
    actionHistory,
    validationErrors,
    isProcessing,
    selectAll,
    deselectAll,
    toggleSelectionMode,
    executeBulkAction,
    cancelBulkAction,
    undoLastAction,
    clearActionHistory,
    getActionStats,
    availableActions,
    maxSelection
  } = useBulkActions(contentType, options);

  /**
   * Handle action selection
   */
  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setShowActions(false);
    
    // Show confirmation for destructive actions
    if (action.destructive) {
      setShowConfirmation(true);
    } else {
      setShowActions(true);
    }
  };

  /**
   * Handle action execution
   */
  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    const result = await executeBulkAction(selectedAction, actionData);
    
    if (result.success && onActionComplete) {
      onActionComplete(result);
    }
    
    setSelectedAction(null);
    setActionData({});
    setShowActions(false);
    setShowConfirmation(false);
  };

  /**
   * Handle undo action
   */
  const handleUndoAction = async () => {
    const result = await undoLastAction();
    if (result.success && onActionComplete) {
      onActionComplete(result);
    }
  };

  /**
   * Get selection status
   */
  const getSelectionStatus = () => {
    const selectedCount = selectedItems.length;
    const totalCount = items.length;
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;
    
    return {
      selectedCount,
      totalCount,
      isAllSelected,
      isPartiallySelected
    };
  };

  /**
   * Handle select all toggle
   */
  const handleSelectAllToggle = () => {
    const { isAllSelected } = getSelectionStatus();
    
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll(items.map(item => item.id));
    }
  };

  /**
   * Format action progress
   */
  const formatProgress = () => {
    if (!actionProgress.current) return null;
    
    const percentage = Math.round((actionProgress.current / actionProgress.total) * 100);
    return {
      percentage,
      current: actionProgress.current,
      total: actionProgress.total,
      status: actionProgress.status
    };
  };

  /**
   * Get action icon
   */
  const getActionIcon = (actionId) => {
    const icons = {
      publish: '📢',
      unpublish: '📝',
      approve: '✅',
      reject: '❌',
      feature: '⭐',
      unfeature: '📄',
      delete: '🗑️',
      archive: '📦',
      activate: '✅',
      deactivate: '⏸️',
      promote: '⬆️',
      demote: '⬇️',
      send_email: '📧',
      export: '📤'
    };
    return icons[actionId] || '⚙️';
  };

  const selectionStatus = getSelectionStatus();
  const progress = formatProgress();
  const stats = getActionStats();

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {selectionStatus.isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : selectionStatus.isPartiallySelected ? (
                <div className="w-5 h-5 border-2 border-blue-600 bg-blue-600 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
              ) : (
                <Square className="w-5 h-5 border-2 border-gray-400" />
              )}
              <span>
                {selectionStatus.isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>

          {/* Selection Status */}
          {selectionStatus.selectedCount > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectionStatus.selectedCount} of {selectionStatus.totalCount} selected
              {selectionStatus.selectedCount >= maxSelection && (
                <span className="ml-2 text-orange-600">(Max reached)</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Selection Mode Toggle */}
          <Button
            variant={isSelecting ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleSelectionMode}
          >
            {isSelecting ? 'Exit Selection' : 'Bulk Actions'}
          </Button>

          {/* Clear Selection */}
          {selectionStatus.selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectionStatus.selectedCount > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectionStatus.selectedCount} items selected
              </span>

              {/* Action Dropdown */}
              <div className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  disabled={isProcessing}
                >
                  <span className="mr-2">Actions</span>
                  {showActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {showActions && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Available Actions
                      </div>
                      
                      {availableActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionSelect(action)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 ${
                            action.destructive ? 'text-red-600 hover:text-red-800' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-lg">{action.icon}</span>
                          <div>
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {action.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action History */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-600 hover:text-gray-800"
              >
                <History className="w-4 h-4 mr-1" />
                History
              </Button>
            </div>

            {/* Undo Last Action */}
            {actionHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndoAction}
                disabled={isProcessing}
                className="text-gray-600 hover:text-gray-800"
              >
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Action Progress */}
      {isProcessing && progress && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Processing {bulkAction?.label}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelBulkAction}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {progress.current} of {progress.total} items processed ({progress.percentage}%)
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">
              Validation Errors
            </span>
          </div>
          
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action History Panel */}
      {showHistory && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Action History
            </h3>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearActionHistory}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* History Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalActions}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Actions</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalSuccessful}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.totalItemsProcessed}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Items Processed</div>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="space-y-2">
            {actionHistory.slice(0, 10).map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getActionIcon(action.action)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {action.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.itemCount} items
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {action.successful} ✓ {action.failed} ✗
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Destructive Action
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {selectedAction.label.toLowerCase()} {selectionStatus.selectedCount} items? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedAction(null);
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="danger"
                onClick={handleExecuteAction}
                loading={isProcessing}
              >
                {selectedAction.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BulkActionsPanel.propTypes = {
  contentType: PropTypes.string.isRequired,
  items: PropTypes.array,
  onActionComplete: PropTypes.func,
  options: PropTypes.object
};

export default BulkActionsPanel; 