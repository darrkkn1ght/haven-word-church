import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { 
  getDonations, 
  createDonation 
} from '../../services/memberService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  Gift, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Filter,
  Download,
  DollarSign,
  CreditCard,
  Building2,
  Wallet,
  BarChart3,
  PieChart
} from 'lucide-react';

const MyDonations = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    year: new Date().getFullYear().toString()
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    type: 'Offering',
    method: 'Bank Transfer'
  });
  const [submitting, setSubmitting] = useState(false);

  // Donation types
  const donationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Tithe', label: 'Tithe' },
    { value: 'Offering', label: 'Offering' },
    { value: 'Building Fund', label: 'Building Fund' },
    { value: 'Missions', label: 'Missions' },
    { value: 'Other', label: 'Other' }
  ];

  // Payment methods
  const paymentMethods = [
    { value: 'Bank Transfer', label: 'Bank Transfer', icon: Building2 },
    { value: 'Credit Card', label: 'Credit Card', icon: CreditCard },
    { value: 'Cash', label: 'Cash', icon: DollarSign },
    { value: 'Mobile Money', label: 'Mobile Money', icon: Wallet }
  ];

  // Year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  /**
   * Fetch donations on component mount and filter changes
   */
  useEffect(() => {
    fetchDonations();
  }, [currentPage, filters]);

  /**
   * Fetch donations from API
   */
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await getDonations(params);
      setDonations(response.donations);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setTotalAmount(response.totalAmount);
    } catch (error) {
      console.error('Error fetching donations:', error);
      showNotification('Failed to load donations', 'error');
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
   * Handle donation creation
   */
  const handleCreate = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createDonation({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      showNotification('Donation recorded successfully', 'success');
      setShowCreateModal(false);
      setFormData({ amount: '', type: 'Offering', method: 'Bank Transfer' });
      fetchDonations();
    } catch (error) {
      console.error('Error creating donation:', error);
      showNotification('Failed to record donation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
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

  /**
   * Get donation type icon
   */
  const getDonationTypeIcon = (type) => {
    const icons = {
      'Tithe': <Gift className="w-5 h-5 text-green-600" />,
      'Offering': <DollarSign className="w-5 h-5 text-blue-600" />,
      'Building Fund': <TrendingUp className="w-5 h-5 text-purple-600" />,
      'Missions': <Gift className="w-5 h-5 text-orange-600" />,
      'Other': <Gift className="w-5 h-5 text-gray-600" />
    };
    return icons[type] || <Gift className="w-5 h-5 text-gray-600" />;
  };

  /**
   * Get payment method icon
   */
  const getPaymentMethodIcon = (method) => {
    const icons = {
      'Bank Transfer': <Building2 className="w-4 h-4" />,
      'Credit Card': <CreditCard className="w-4 h-4" />,
      'Cash': <DollarSign className="w-4 h-4" />,
      'Mobile Money': <Wallet className="w-4 h-4" />
    };
    return icons[method] || <DollarSign className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading donations..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Donations - Haven Word Church</title>
        <meta name="description" content="Track and manage your donations and giving history." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b mt-20 sm:mt-24 md:mt-28">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
                <p className="text-gray-600 mt-1">Track and manage your giving history</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Donation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Given</h3>
              <p className="text-sm text-gray-600">This {filters.year}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{total}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Donations</h3>
              <p className="text-sm text-gray-600">This {filters.year}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {total > 0 ? formatCurrency(totalAmount / total) : formatCurrency(0)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Average Donation</h3>
              <p className="text-sm text-gray-600">This {filters.year}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {donationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {yearOptions.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ type: 'all', year: new Date().getFullYear().toString() });
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

          {/* Donations List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Donation History ({total})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
                  <p className="text-gray-600 mb-6">
                    {filters.type !== 'all' || filters.year !== new Date().getFullYear().toString()
                      ? 'Try adjusting your filters.'
                      : 'Record your first donation to get started.'
                    }
                  </p>
                  {filters.type === 'all' && filters.year === new Date().getFullYear().toString() && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      variant="primary"
                      size="md"
                    >
                      Record Donation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                            {getDonationTypeIcon(donation.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{donation.type}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(donation.date)}
                              </div>
                              <div className="flex items-center">
                                {getPaymentMethodIcon(donation.method)}
                                <span className="ml-1">{donation.method}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
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
        title="Record Donation"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (NGN) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {donationTypes.slice(1).map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
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
            {submitting ? 'Recording...' : 'Record Donation'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default MyDonations;
