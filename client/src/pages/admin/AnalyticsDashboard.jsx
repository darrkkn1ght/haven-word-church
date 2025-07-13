import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [analytics, setAnalytics] = useState({
    overview: {},
    userStats: {},
    contentStats: {},
    engagementStats: {},
    topContent: [],
    recentActivity: []
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiCall('GET', `/admin/analytics?timeRange=${timeRange}`);
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const getTimeRangeLabel = () => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last year'
    };
    return labels[timeRange] || 'Last 30 days';
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary-700 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track user engagement, content performance, and site activity
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing data for {getTimeRangeLabel()}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(analytics.overview?.totalUsers || 0)}
          change={analytics.overview?.userGrowth || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Content"
          value={formatNumber(analytics.overview?.activeContent || 0)}
          change={analytics.overview?.contentGrowth || 0}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Total Views"
          value={formatNumber(analytics.overview?.totalViews || 0)}
          change={analytics.overview?.viewGrowth || 0}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Engagement Rate"
          value={formatPercentage(analytics.overview?.engagement || 0, 100)}
          change={analytics.overview?.engagementGrowth || 0}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Activity Chart */}
        <ChartCard title="User Activity">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">User activity chart will be displayed here</p>
              <p className="text-sm text-gray-400">Chart integration coming soon</p>
            </div>
          </div>
        </ChartCard>

        {/* Content Performance Chart */}
        <ChartCard title="Content Performance">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Content performance chart will be displayed here</p>
              <p className="text-sm text-gray-400">Chart integration coming soon</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Statistics */}
        <ChartCard title="User Statistics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.userStats?.newUsers || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.userStats?.activeUsers || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Members</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.userStats?.members || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pastors</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.userStats?.pastors || 0)}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Content Statistics */}
        <ChartCard title="Content Statistics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Blog Posts</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.contentStats?.blogs || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sermons</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.contentStats?.sermons || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Events</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.contentStats?.events || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Review</span>
              <span className="font-semibold text-yellow-600">
                {formatNumber(analytics.contentStats?.pending || 0)}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Engagement Statistics */}
        <ChartCard title="Engagement Statistics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Page Views</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.engagementStats?.pageViews || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Unique Visitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.engagementStats?.uniqueVisitors || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Session</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.engagementStats?.avgSessionTime || '0'} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatPercentage(analytics.engagementStats?.bounceRate || 0, 100)}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Top Content & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <ChartCard title="Top Performing Content">
          <div className="space-y-3">
            {analytics.topContent?.length > 0 ? (
              analytics.topContent.map((content, index) => (
                <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {content.title}
                      </p>
                      <p className="text-xs text-gray-500">{content.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(content.views)}
                    </p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No content data available</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <div className="space-y-3">
            {analytics.recentActivity?.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Export Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download analytics data for external analysis
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 