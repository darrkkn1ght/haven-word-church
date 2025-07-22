import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNotifications } from '../../context/NotificationContext';
import { 
  getPrayerRequests, 
  createPrayerRequest, 
  updatePrayerRequest, 
  deletePrayerRequest 
} from '../../services/memberService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react';

const PrayerRequests = () => {
  const { showNotification } = useNotifications();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'praying', label: 'Being Prayed For' },
    { value: 'answered', label: 'Answered' },
    { value: 'archived', label: 'Archived' }
  ];

  /**
   * Fetch prayer requests on component mount and filter changes
   */
  useEffect(() => {
    fetchPrayerRequests();
  }, [currentPage, filters, fetchPrayerRequests]);

  /**
   * Fetch prayer requests from API
   */
  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await getPrayerRequests(params);
      setPrayerRequests(response.prayerRequests);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      showNotification('Failed to load prayer requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  /**
   * Handle prayer request creation
   */
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createPrayerRequest(formData);
      
      showNotification('Prayer request submitted successfully', 'success');
      setShowCreateModal(false);
      setFormData({ title: '', message: '' });
      fetchPrayerRequests();
    } catch (error) {
      console.error('Error creating prayer request:', error);
      showNotification('Failed to submit prayer request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle prayer request update
   */
  const handleUpdate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await updatePrayerRequest(selectedRequest._id, formData);
      
      showNotification('Prayer request updated successfully', 'success');
      setShowEditModal(false);
      setSelectedRequest(null);
      setFormData({ title: '', message: '' });
      fetchPrayerRequests();
    } catch (error) {
      console.error('Error updating prayer request:', error);
      showNotification('Failed to update prayer request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle prayer request deletion
   */
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deletePrayerRequest(selectedRequest._id);
      
      showNotification('Prayer request deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedRequest(null);
      fetchPrayerRequests();
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      showNotification('Failed to delete prayer request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open edit modal
   */
  const openEditModal = (request) => {
    setSelectedRequest(request);
    setFormData({
      title: request.title,
      message: request.message
    });
    setShowEditModal(true);
  };

  /**
   * Open delete modal
   */
  const openDeleteModal = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      praying: 'bg-purple-100 text-purple-800',
      answered: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      pending: <AlertCircle className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      praying: <Heart className="w-4 h-4" />,
      answered: <CheckCircle className="w-4 h-4" />,
      archived: <Archive className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading prayer requests..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Prayer Requests - Haven Word Church</title>
        <meta name="description" content="Submit and manage your prayer requests with the church community." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b mt-20 sm:mt-24 md:mt-28">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
                <p className="text-gray-600 mt-1">Submit and manage your prayer requests</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Prayer Request
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search prayer requests..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ status: 'all', search: '' });
                    setCurrentPage(1);
                  }}
                  variant="ghost"
                  size="md"
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Prayer Requests List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Prayer Requests ({total})
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              {prayerRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prayer requests found</h3>
                  <p className="text-gray-600 mb-6">
                    {filters.status !== 'all' || filters.search 
                      ? 'Try adjusting your filters or search terms.'
                      : 'Submit your first prayer request to get started.'
                    }
                  </p>
                  {filters.status === 'all' && !filters.search && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="primary"
                      size="md"
                    >
                      Submit Prayer Request
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {prayerRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{request.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(request.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(request.date).toLocaleTimeString('en-NG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => openEditModal(request)}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => openDeleteModal(request)}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="ghost"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="ghost"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit Prayer Request"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title for your prayer request"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prayer Request *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Share your prayer request details..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowCreateModal(false)}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="primary"
            size="md"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Prayer Request"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title for your prayer request"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prayer Request *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Share your prayer request details..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={() => setShowEditModal(false)}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="primary"
            size="md"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Request'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Prayer Request"
        size="md"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Prayer Request
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{selectedRequest?.title}"? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            size="md"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete Request'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PrayerRequests;
