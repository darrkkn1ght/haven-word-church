import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/ui/Modal';

const ManageContent = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [moderationNotes, setModerationNotes] = useState('');

  // Load content based on active tab
  useEffect(() => {
    loadContent();
  }, [activeTab, statusFilter, currentPage, loadContent]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'blogs' ? '/admin/blogs' : '/admin/sermons';
      const response = await apiCall('GET', `${endpoint}?status=${statusFilter}&page=${currentPage}`);
      
      if (activeTab === 'blogs') {
        setBlogs(response.blogs || []);
        setPagination(response.pagination || {});
      } else {
        setSermons(response.sermons || []);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, itemId, itemType) => {
    try {
      let endpoint = '';
      let method = 'PATCH';
      let data = {};

      switch (action) {
        case 'approve':
          endpoint = `/admin/${itemType}/${itemId}/approve`;
          data = { moderationNotes };
          break;
        case 'reject':
          endpoint = `/admin/${itemType}/${itemId}/reject`;
          data = { moderationNotes };
          break;
        case 'edit':
          endpoint = `/admin/${itemType}/${itemId}`;
          method = 'PUT';
          data = editForm;
          break;
        case 'delete':
          endpoint = `/admin/${itemType}/${itemId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      await apiCall(method, endpoint, data);
      
      // Refresh content
      await loadContent();
      
      // Close modal and reset state
      setShowModal(false);
      setSelectedItem(null);
      setEditForm({});
      setModerationNotes('');
      
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    
    if (type === 'edit') {
      setEditForm({
        title: item.title,
        excerpt: item.excerpt || '',
        content: item.content || '',
        category: item.category || '',
        tags: item.tags || [],
        featuredImage: item.featuredImage || {},
        description: item.description || '',
        scriptureReference: item.scriptureReference || '',
        keyVerse: item.keyVerse || '',
        speaker: item.speaker || {},
        serviceType: item.serviceType || '',
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      flagged: { color: 'bg-orange-100 text-orange-800', text: 'Flagged' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderBlogsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {blogs.map((blog) => (
            <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{blog.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{blog.excerpt?.substring(0, 50)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{blog.author?.name || blog.authorName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{blog.author?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(blog.moderationStatus)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(blog.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {blog.moderationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => openModal('approve', blog)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal('reject', blog)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openModal('edit', blog)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal('delete', blog)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSermonsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Speaker</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {sermons.map((sermon) => (
            <tr key={sermon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{sermon.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{sermon.description?.substring(0, 50)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{sermon.speaker?.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{sermon.speaker?.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(sermon.moderationStatus)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(sermon.serviceDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {sermon.moderationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => openModal('approve', sermon)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal('reject', sermon)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openModal('edit', sermon)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal('delete', sermon)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderModal = () => {
    if (!showModal || !selectedItem) return null;

    const isBlog = activeTab === 'blogs';
    const itemType = isBlog ? 'blogs' : 'sermons';

    return (
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          {modalType === 'approve' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Approve {isBlog ? 'Blog Post' : 'Sermon'}</h3>
              <p className="mb-4">Are you sure you want to approve "{selectedItem.title}"?</p>
              <textarea
                placeholder="Moderation notes (optional)"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                rows="3"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('approve', selectedItem._id, itemType)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          )}

          {modalType === 'reject' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Reject {isBlog ? 'Blog Post' : 'Sermon'}</h3>
              <p className="mb-4">Are you sure you want to reject "{selectedItem.title}"?</p>
              <textarea
                placeholder="Reason for rejection (required)"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                rows="3"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('reject', selectedItem._id, itemType)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {modalType === 'edit' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Edit {isBlog ? 'Blog Post' : 'Sermon'}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                {isBlog ? (
                  <>
                    <textarea
                      placeholder="Excerpt"
                      value={editForm.excerpt || ''}
                      onChange={(e) => setEditForm({...editForm, excerpt: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                    <textarea
                      placeholder="Content"
                      value={editForm.content || ''}
                      onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows="6"
                    />
                  </>
                ) : (
                  <>
                    <textarea
                      placeholder="Description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                    <input
                      type="text"
                      placeholder="Scripture Reference"
                      value={editForm.scriptureReference || ''}
                      onChange={(e) => setEditForm({...editForm, scriptureReference: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('edit', selectedItem._id, itemType)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {modalType === 'delete' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Delete {isBlog ? 'Blog Post' : 'Sermon'}</h3>
              <p className="mb-4">Are you sure you want to delete "{selectedItem.title}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('delete', selectedItem._id, itemType)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary-700 dark:text-white">Content Moderation</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review, approve, edit, or delete blogs and sermons submitted by users.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blogs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Blog Posts ({blogs.length})
            </button>
            <button
              onClick={() => setActiveTab('sermons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sermons'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sermons ({sermons.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {activeTab === 'blogs' ? renderBlogsTable() : renderSermonsTable()}
          
          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.current} of {pagination.total}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default ManageContent;
