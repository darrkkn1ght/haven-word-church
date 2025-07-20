const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Blog = require('../models/Blog');
const Sermon = require('../models/Sermon');
const ActivityLog = require('../models/ActivityLog');
const { getAnalytics, getUserActivityChart, getContentPerformanceChart } = require('../controllers/analyticsController');
const exportController = require('../controllers/exportController');
const { Parser } = require('json2csv');

// Middleware to ensure admin access
const adminOnly = [auth, role(['admin'])];

// Analytics routes
router.get('/analytics', adminOnly, getAnalytics);
router.get('/analytics/user-activity', adminOnly, getUserActivityChart);
router.get('/analytics/content-performance', adminOnly, getContentPerformanceChart);

// Get all blogs for moderation (admin only)
router.get('/blogs', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.moderationStatus = status;
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + blogs.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
});

// Get all sermons for moderation (admin only)
router.get('/sermons', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.moderationStatus = status;
    }
    
    const sermons = await Sermon.find(query)
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Sermon.countDocuments(query);
    
    res.json({
      sermons,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + sermons.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sermons', error: error.message });
  }
});

// Approve a blog post (admin only)
router.patch('/blogs/:id/approve', adminOnly, async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'approved',
        status: 'published',
        publishedAt: new Date(),
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNotes: moderationNotes || ''
      },
      { new: true }
    ).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog approved successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Error approving blog', error: error.message });
  }
});

// Reject a blog post (admin only)
router.patch('/blogs/:id/reject', adminOnly, async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'rejected',
        status: 'draft',
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNotes: moderationNotes || ''
      },
      { new: true }
    ).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog rejected successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting blog', error: error.message });
  }
});

// Approve a sermon (admin only)
router.patch('/sermons/:id/approve', adminOnly, async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    const sermon = await Sermon.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'approved',
        status: 'published',
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNotes: moderationNotes || ''
      },
      { new: true }
    );
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    res.json({ message: 'Sermon approved successfully', sermon });
  } catch (error) {
    res.status(500).json({ message: 'Error approving sermon', error: error.message });
  }
});

// Reject a sermon (admin only)
router.patch('/sermons/:id/reject', adminOnly, async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    const sermon = await Sermon.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'rejected',
        status: 'draft',
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNotes: moderationNotes || ''
      },
      { new: true }
    );
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    res.json({ message: 'Sermon rejected successfully', sermon });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting sermon', error: error.message });
  }
});

// Update blog content (admin only)
router.put('/blogs/:id', adminOnly, async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, featuredImage } = req.body;
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        excerpt,
        content,
        category,
        tags,
        featuredImage
      },
      { new: true }
    ).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// Update sermon content (admin only)
router.put('/sermons/:id', adminOnly, async (req, res) => {
  try {
    const { title, description, scriptureReference, keyVerse, speaker, serviceType, category } = req.body;
    
    const sermon = await Sermon.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        scriptureReference,
        keyVerse,
        speaker,
        serviceType,
        category
      },
      { new: true }
    );
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    res.json({ message: 'Sermon updated successfully', sermon });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sermon', error: error.message });
  }
});

// Delete blog (admin only)
router.delete('/blogs/:id', adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

// Delete sermon (admin only)
router.delete('/sermons/:id', adminOnly, async (req, res) => {
  try {
    const sermon = await Sermon.findByIdAndDelete(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    res.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sermon', error: error.message });
  }
});

// Content Export (Backup/Migration)
router.get('/export/options', adminOnly, exportController.getExportOptions);
router.post('/export', adminOnly, exportController.createExport);
router.get('/export/:jobId', adminOnly, exportController.getExportStatus);
router.get('/export/:jobId/download', adminOnly, exportController.downloadExport);
router.get('/export/history', adminOnly, exportController.getExportHistory);
router.delete('/export/:jobId', adminOnly, exportController.deleteExport);

// Admin: Get activity logs (with filters/search)
router.get('/activity-logs', adminOnly, async (req, res) => {
  try {
    const { user, action, targetType, status, q, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};
    if (user) query.user = user;
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;
    if (status) query.status = status;
    if (q) query.$or = [
      { description: { $regex: q, $options: 'i' } },
      { 'metadata': { $regex: q, $options: 'i' } }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(query);
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
});

// Admin: Export activity logs (CSV/JSON)
router.get('/activity-logs/export', adminOnly, async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    const logs = await ActivityLog.find(filters).populate('user', 'name email role').lean();
    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="activity_logs.json"');
      res.json(logs);
    } else {
      const fields = ['createdAt', 'user.name', 'user.email', 'action', 'targetType', 'targetId', 'description', 'status', 'ip', 'userAgent'];
      const parser = new Parser({ fields });
      const csv = parser.parse(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="activity_logs.csv"');
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting activity logs', error: error.message });
  }
});

// Admin: Delete activity log
router.delete('/activity-logs/:id', adminOnly, async (req, res) => {
  try {
    await ActivityLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activity log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity log', error: error.message });
  }
});

// Global search endpoint (demo)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  // TODO: Implement real search across collections
  res.json({
    message: 'Global search is not yet implemented',
    query: q,
    results: []
  });
});

// Generic bulk-action endpoint (demo)
router.post('/:contentType/:itemId/bulk-action', async (req, res) => {
  const { contentType, itemId } = req.params;
  const { action } = req.body;
  // TODO: Implement real bulk action logic
  res.json({
    message: `Bulk action '${action}' on ${contentType} with ID ${itemId} is not yet implemented.`
  });
});

module.exports = router; 