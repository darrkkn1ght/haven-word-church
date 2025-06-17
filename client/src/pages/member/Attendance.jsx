import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { memberService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEOHead from '../../components/common/SEOHead';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Award,
  Target,
  BarChart3,
  Filter,
  Download,
  QrCode,
  Smartphone,
  Church
} from 'lucide-react';

/**
 * Member Attendance Page Component
 * Displays attendance history, statistics, and check-in functionality
 * 
 * Features:
 * - Attendance history with filters
 * - QR code check-in system
 * - Attendance statistics and trends
 * - Service type filtering
 * - Monthly/yearly views
 * - Attendance goals tracking
 * 
 * @component
 * @returns {JSX.Element} Attendance page component
 */
const Attendance = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [currentServices, setCurrentServices] = useState([]);
  const [filters, setFilters] = useState({
    serviceType: 'all',
    dateRange: 'all',
    year: new Date().getFullYear()
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Service types for filtering
  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'sunday_service', label: 'Sunday Service' },
    { value: 'midweek_service', label: 'Midweek Service' },
    { value: 'prayer_meeting', label: 'Prayer Meeting' },
    { value: 'special_service', label: 'Special Service' },
    { value: 'bible_study', label: 'Bible Study' }
  ];

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' }
  ];

  /**
   * Fetch attendance data on component mount and filter changes
   */
  useEffect(() => {
    fetchAttendanceData();
    fetchCurrentServices();
  }, [filters]);

  /**
   * Fetch attendance records from API
   */
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAttendance(filters);
      setAttendanceData(response.data.records);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showNotification('Failed to load attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch current/upcoming services for check-in
   */
  const fetchCurrentServices = async () => {
    try {
      const response = await memberService.getCurrentServices();
      setCurrentServices(response.data);
    } catch (error) {
      console.error('Error fetching current services:', error);
    }
  };

  /**
   * Handle service check-in
   * @param {string} serviceId - Service ID to check into
   */
  const handleCheckIn = async (serviceId) => {
    try {
      setCheckingIn(true);
      const response = await memberService.checkInToService(serviceId);
      
      showNotification('Successfully checked in to service!', 'success');
      
      // Update attendance data
      fetchAttendanceData();
      fetchCurrentServices();
      
    } catch (error) {
      console.error('Error checking in:', error);
      const message = error.response?.data?.message || 'Failed to check in to service';
      showNotification(message, 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  /**
   * Handle QR code scan for check-in
   * @param {string} qrData - QR code data
   */
  const handleQRScan = async (qrData) => {
    try {
      const serviceId = extractServiceIdFromQR(qrData);
      if (serviceId) {
        await handleCheckIn(serviceId);
      } else {
        showNotification('Invalid QR code', 'error');
      }
    } catch (error) {
      showNotification('Failed to process QR code', 'error');
    } finally {
      setShowQRScanner(false);
    }
  };

  /**
   * Extract service ID from QR code data
   * @param {string} qrData - QR code data
   * @returns {string|null} Service ID or null
   */
  const extractServiceIdFromQR = (qrData) => {
    try {
      const data = JSON.parse(qrData);
      return data.serviceId || null;
    } catch {
      return null;
    }
  };

  /**
   * Calculate attendance percentage
   * @param {number} attended - Number of services attended
   * @param {number} total - Total number of services
   * @returns {number} Percentage
   */
  const calculatePercentage = (attended, total) => {
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format time for display
   * @param {string} timeString - ISO time string
   * @returns {string} Formatted time
   */
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get attendance status badge
   * @param {string} status - Attendance status
   * @returns {JSX.Element} Status badge
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle, 
        text: 'Present' 
      },
      absent: { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle, 
        text: 'Absent' 
      },
      late: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock, 
        text: 'Late' 
      }
    };

    const config = statusConfig[status] || statusConfig.absent;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  /**
   * Export attendance data
   */
  const exportAttendance = async () => {
    try {
      const response = await memberService.exportAttendance(filters);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${user.firstName}_${user.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      showNotification('Attendance data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      showNotification('Failed to export attendance data', 'error');
    }
  };

  if (loading && attendanceData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="My Attendance - Haven Word Church"
        description="Track your service attendance and check into current services"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
            <p className="mt-2 text-gray-600">
              Track your service attendance and check into current services
            </p>
          </div>

          {/* Current Services - Check In */}
          {currentServices.length > 0 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-blue-900">
                  Current Services - Check In Available
                </h2>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Scan QR Code
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentServices.map((service) => (
                  <div key={service._id} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-sm text-gray-600">{service.type}</p>
                      </div>
                      <Church className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(service.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {formatTime(service.startTime)} - {formatTime(service.endTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {service.location || 'Main Sanctuary'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCheckIn(service._id)}
                      disabled={checkingIn || service.checkedIn}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        service.checkedIn
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {checkingIn ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="small" />
                          Checking In...
                        </span>
                      ) : service.checkedIn ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Checked In
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Check In
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalServices || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Church className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Services Attended</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.attendedServices || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculatePercentage(statistics.attendedServices, statistics.totalServices)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.currentStreak || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Service Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    value={filters.serviceType}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      serviceType: e.target.value
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {serviceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: e.target.value
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      year: parseInt(e.target.value)
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={exportAttendance}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance History
              </h3>
            </div>

            <div className="overflow-x-auto">
              {attendanceData.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.service.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.service.type}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(record.service.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(record.service.startTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.service.location || 'Main Sanctuary'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkInTime ? formatTime(record.checkInTime) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Attendance Records
                  </h3>
                  <p className="text-gray-600">
                    {filters.serviceType !== 'all' || filters.dateRange !== 'all'
                      ? 'No records found for the selected filters.'
                      : 'Start attending services to see your attendance history here.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Goals */}
          {statistics.attendanceGoal && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Goal
                </h3>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Progress: {statistics.attendedServices} / {statistics.attendanceGoal} services
                  </span>
                  <span className="font-medium text-gray-900">
                    {calculatePercentage(statistics.attendedServices, statistics.attendanceGoal)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(
                        calculatePercentage(statistics.attendedServices, statistics.attendanceGoal), 
                        100
                      )}%` 
                    }}
                  />
                </div>
                
                <p className="text-sm text-gray-600">
                  {statistics.attendedServices >= statistics.attendanceGoal
                    ? 'Congratulations! You\'ve reached your attendance goal! 🎉'
                    : `${statistics.attendanceGoal - statistics.attendedServices} more services to reach your goal.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal (Placeholder) */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan QR Code
              </h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                QR Code scanner would be implemented here using a camera library like react-qr-scanner
              </p>
              <button
                onClick={() => setShowQRScanner(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Attendance;