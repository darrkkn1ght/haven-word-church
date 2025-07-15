const User = require('../models/User');
const Blog = require('../models/Blog');
const Sermon = require('../models/Sermon');
const Event = require('../models/Event');

/**
 * Analytics Controller for Haven Word Church
 * Provides comprehensive analytics data for admin dashboard
 * Tracks user engagement, content performance, and site activity
 */

/**
 * Get analytics overview data
 * @route GET /api/admin/analytics
 * @access Admin only
 */
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    const startDate = timeRanges[timeRange] || timeRanges['30d'];
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

    // Get current period data
    const currentData = await getPeriodData(startDate, now);
    
    // Get previous period data for comparison
    const previousData = await getPeriodData(previousStartDate, startDate);

    // Calculate growth percentages
    const overview = {
      totalUsers: currentData.totalUsers,
      userGrowth: calculateGrowth(currentData.totalUsers, previousData.totalUsers),
      activeContent: currentData.activeContent,
      contentGrowth: calculateGrowth(currentData.activeContent, previousData.activeContent),
      totalViews: currentData.totalViews,
      viewGrowth: calculateGrowth(currentData.totalViews, previousData.totalViews),
      engagement: currentData.engagement,
      engagementGrowth: calculateGrowth(currentData.engagement, previousData.engagement)
    };

    // User statistics
    const userStats = await getUserStats(startDate, now);
    
    // Content statistics
    const contentStats = await getContentStats(startDate, now);
    
    // Engagement statistics
    const engagementStats = await getEngagementStats(startDate, now);
    
    // Top performing content
    const topContent = await getTopContent(startDate, now);
    
    // Recent activity
    const recentActivity = await getRecentActivity(startDate, now);

    res.json({
      success: true,
      data: {
        overview,
        userStats,
        contentStats,
        engagementStats,
        topContent,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

/**
 * Get data for a specific time period
 */
const getPeriodData = async (startDate, endDate) => {
  const [
    totalUsers,
    activeContent,
    totalViews,
    engagement
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Blog.countDocuments({ 
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'published'
    }) + Sermon.countDocuments({ 
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'published'
    }),
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]).then(result => result[0]?.totalViews || 0),
    calculateEngagementRate(startDate, endDate)
  ]);

  return {
    totalUsers,
    activeContent,
    totalViews,
    engagement
  };
};

/**
 * Get user statistics
 */
const getUserStats = async (startDate, endDate) => {
  const [
    newUsers,
    activeUsers,
    members,
    pastors
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    User.countDocuments({ 
      lastLoginAt: { $gte: startDate, $lte: endDate }
    }),
    User.countDocuments({ role: 'member' }),
    User.countDocuments({ role: 'pastor' })
  ]);

  return {
    newUsers,
    activeUsers,
    members,
    pastors
  };
};

/**
 * Get content statistics
 */
const getContentStats = async (startDate, endDate) => {
  const [
    blogs,
    sermons,
    events,
    pending
  ] = await Promise.all([
    Blog.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Sermon.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Event.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Blog.countDocuments({ moderationStatus: 'pending' }) + 
    Sermon.countDocuments({ moderationStatus: 'pending' })
  ]);

  return {
    blogs,
    sermons,
    events,
    pending
  };
};

/**
 * Get engagement statistics
 */
const getEngagementStats = async (startDate, endDate) => {
  // This would typically come from analytics service like Google Analytics
  // For now, we'll use basic content views as a proxy
  const totalViews = await Blog.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]).then(result => result[0]?.totalViews || 0);

  const uniqueVisitors = await User.countDocuments({
    lastLoginAt: { $gte: startDate, $lte: endDate }
  });

  return {
    pageViews: totalViews,
    uniqueVisitors,
    avgSessionTime: 5, // Mock data - would come from analytics service
    bounceRate: 35 // Mock data - would come from analytics service
  };
};

/**
 * Get top performing content
 */
const getTopContent = async (startDate, endDate) => {
  const topBlogs = await Blog.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'published'
  })
  .sort({ views: -1 })
  .limit(5)
  .select('title views')
  .lean();

  const topSermons = await Sermon.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'published'
  })
  .sort({ 'analytics.views': -1 })
  .limit(5)
  .select('title analytics.views')
  .lean();

  const topContent = [
    ...topBlogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      views: blog.views || 0,
      type: 'Blog Post'
    })),
    ...topSermons.map(sermon => ({
      id: sermon._id,
      title: sermon.title,
      views: sermon.analytics?.views || 0,
      type: 'Sermon'
    }))
  ].sort((a, b) => b.views - a.views).slice(0, 5);

  return topContent;
};

/**
 * Get recent activity
 */
const getRecentActivity = async (startDate, endDate) => {
  const recentBlogs = await Blog.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .populate('author', 'firstName lastName')
  .lean();

  const recentSermons = await Sermon.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

  const recentUsers = await User.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

  const activities = [
    ...recentBlogs.map(blog => ({
      description: `New blog post "${blog.title}" by ${blog.author?.firstName} ${blog.author?.lastName}`,
      timestamp: blog.createdAt,
      type: 'blog'
    })),
    ...recentSermons.map(sermon => ({
      description: `New sermon "${sermon.title}" uploaded`,
      timestamp: sermon.createdAt,
      type: 'sermon'
    })),
    ...recentUsers.map(user => ({
      description: `New user ${user.firstName} ${user.lastName} registered`,
      timestamp: user.createdAt,
      type: 'user'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  return activities;
};

/**
 * Calculate growth percentage
 */
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

/**
 * Calculate engagement rate
 */
const calculateEngagementRate = async (startDate, endDate) => {
  // This would typically be calculated from user interactions
  // For now, we'll use a simple calculation based on content views vs users
  const totalViews = await Blog.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]).then(result => result[0]?.totalViews || 0);

  const totalUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  if (totalUsers === 0) return 0;
  return Math.min((totalViews / totalUsers) * 10, 100); // Scale factor for reasonable percentage
};

/**
 * Get user activity chart data
 * @route GET /api/admin/analytics/user-activity
 * @access Admin only
 */
const getUserActivityChart = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    const startDate = timeRanges[timeRange] || timeRanges['30d'];

    // Get daily user registrations
    const dailyUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: dailyUsers
    });
  } catch (error) {
    console.error('User activity chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity data',
      error: error.message
    });
  }
};

/**
 * Get content performance chart data
 * @route GET /api/admin/analytics/content-performance
 * @access Admin only
 */
const getContentPerformanceChart = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    const startDate = timeRanges[timeRange] || timeRanges['30d'];

    // Get content by category
    const blogCategories = await Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: 'published'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const sermonCategories = await Sermon.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: 'published'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        blogs: blogCategories,
        sermons: sermonCategories
      }
    });
  } catch (error) {
    console.error('Content performance chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content performance data',
      error: error.message
    });
  }
};

module.exports = {
  getAnalytics,
  getUserActivityChart,
  getContentPerformanceChart
}; 