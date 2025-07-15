const Blog = require('../models/Blog');
const Sermon = require('../models/Sermon');
const Event = require('../models/Event');
const User = require('../models/User');
const Ministry = require('../models/Ministry');
const Attendance = require('../models/Attendance');
const Contact = require('../models/Contact');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { Parser } = require('json2csv');
const xml2js = require('xml2js');

/**
 * Content Export Controller for Haven Word Church
 * Handles data export for backup, migration, and analysis purposes
 * 
 * Features:
 * - Multiple export formats (JSON, CSV, XML)
 * - Content type filtering and selection
 * - Date range filtering
 * - Progress tracking for large exports
 * - Export history and management
 * - Compressed archive creation
 * - Data sanitization and formatting
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

/**
 * Get available export options and content types
 * @route GET /api/admin/export/options
 * @access Private (Admin)
 */
const getExportOptions = async (req, res) => {
  try {
    const options = {
      contentTypes: [
        {
          id: 'blogs',
          name: 'Blog Posts',
          description: 'All blog posts, articles, and announcements',
          fields: ['title', 'excerpt', 'content', 'author', 'category', 'tags', 'status', 'createdAt', 'publishedAt'],
          estimatedSize: 'Medium'
        },
        {
          id: 'sermons',
          name: 'Sermons',
          description: 'All sermons with media files and transcripts',
          fields: ['title', 'description', 'scriptureReference', 'speaker', 'serviceDate', 'category', 'media', 'status'],
          estimatedSize: 'Large'
        },
        {
          id: 'events',
          name: 'Events',
          description: 'All church events and programs',
          fields: ['title', 'description', 'startDate', 'endDate', 'category', 'location', 'attendees', 'status'],
          estimatedSize: 'Medium'
        },
        {
          id: 'users',
          name: 'Users',
          description: 'All registered users and members',
          fields: ['name', 'email', 'role', 'active', 'createdAt', 'lastLogin'],
          estimatedSize: 'Small'
        },
        {
          id: 'ministries',
          name: 'Ministries',
          description: 'All church ministries and departments',
          fields: ['name', 'description', 'category', 'leaders', 'members', 'status'],
          estimatedSize: 'Small'
        },
        {
          id: 'attendance',
          name: 'Attendance Records',
          description: 'All attendance tracking data',
          fields: ['user', 'activityType', 'activityTitle', 'attendanceDate', 'checkInTime'],
          estimatedSize: 'Large'
        },
        {
          id: 'contacts',
          name: 'Contact Submissions',
          description: 'All contact form submissions and inquiries',
          fields: ['firstName', 'lastName', 'email', 'subject', 'message', 'contactType', 'createdAt'],
          estimatedSize: 'Small'
        }
      ],
      formats: [
        {
          id: 'json',
          name: 'JSON',
          description: 'Structured data format, best for data migration',
          extension: '.json',
          supportsCompression: true
        },
        {
          id: 'csv',
          name: 'CSV',
          description: 'Spreadsheet format, best for analysis',
          extension: '.csv',
          supportsCompression: true
        },
        {
          id: 'xml',
          name: 'XML',
          description: 'Markup format, best for system integration',
          extension: '.xml',
          supportsCompression: true
        }
      ],
      filters: {
        dateRanges: [
          { id: 'all', name: 'All Time' },
          { id: 'last7days', name: 'Last 7 Days' },
          { id: 'last30days', name: 'Last 30 Days' },
          { id: 'last90days', name: 'Last 90 Days' },
          { id: 'lastYear', name: 'Last Year' },
          { id: 'custom', name: 'Custom Range' }
        ],
        statuses: [
          { id: 'all', name: 'All Statuses' },
          { id: 'published', name: 'Published Only' },
          { id: 'draft', name: 'Drafts Only' },
          { id: 'archived', name: 'Archived Only' }
        ]
      }
    };

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get export options error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching export options',
      error: error.message
    });
  }
};

/**
 * Create content export
 * @route POST /api/admin/export
 * @access Private (Admin)
 */
const createExport = async (req, res) => {
  try {
    const {
      contentTypes,
      format,
      filters,
      includeMedia,
      compress,
      customFileName
    } = req.body;

    // Validate required fields
    if (!contentTypes || !Array.isArray(contentTypes) || contentTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one content type must be selected'
      });
    }

    if (!format || !['json', 'csv', 'xml'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Valid export format is required'
      });
    }

    // Create export job
    const exportJob = {
      id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentTypes,
      format,
      filters: filters || {},
      includeMedia: includeMedia || false,
      compress: compress || false,
      fileName: customFileName || `haven_word_church_export_${new Date().toISOString().split('T')[0]}`,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      createdBy: req.user.id,
      totalItems: 0,
      processedItems: 0
    };

    // Store export job (in production, use Redis or database)
    global.exportJobs = global.exportJobs || new Map();
    global.exportJobs.set(exportJob.id, exportJob);

    // Start export process asynchronously
    processExport(exportJob).catch(error => {
      console.error('Export process error:', error);
      const job = global.exportJobs.get(exportJob.id);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
    });

    res.json({
      success: true,
      message: 'Export job created successfully',
      data: {
        jobId: exportJob.id,
        status: exportJob.status,
        estimatedTime: estimateExportTime(exportJob)
      }
    });
  } catch (error) {
    console.error('Create export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating export job',
      error: error.message
    });
  }
};

/**
 * Get export job status
 * @route GET /api/admin/export/:jobId
 * @access Private (Admin)
 */
const getExportStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    global.exportJobs = global.exportJobs || new Map();
    const job = global.exportJobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Export job not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        downloadUrl: job.status === 'completed' ? `/api/admin/export/${jobId}/download` : null,
        error: job.error
      }
    });
  } catch (error) {
    console.error('Get export status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching export status',
      error: error.message
    });
  }
};

/**
 * Download exported file
 * @route GET /api/admin/export/:jobId/download
 * @access Private (Admin)
 */
const downloadExport = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    global.exportJobs = global.exportJobs || new Map();
    const job = global.exportJobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Export job not found'
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Export is not ready for download'
      });
    }

    const filePath = job.filePath;
    if (!filePath || !(await fs.access(filePath).then(() => true).catch(() => false))) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found'
      });
    }

    const fileName = path.basename(filePath);
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Download export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading export',
      error: error.message
    });
  }
};

/**
 * Get export history
 * @route GET /api/admin/export/history
 * @access Private (Admin)
 */
const getExportHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    global.exportJobs = global.exportJobs || new Map();
    const jobs = Array.from(global.exportJobs.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));
    
    const total = global.exportJobs.size;
    
    res.json({
      success: true,
      data: {
        exports: jobs.map(job => ({
          id: job.id,
          contentTypes: job.contentTypes,
          format: job.format,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          fileName: job.fileName,
          fileSize: job.fileSize,
          error: job.error
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalExports: total,
          hasNext: skip + jobs.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get export history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching export history',
      error: error.message
    });
  }
};

/**
 * Delete export job and file
 * @route DELETE /api/admin/export/:jobId
 * @access Private (Admin)
 */
const deleteExport = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    global.exportJobs = global.exportJobs || new Map();
    const job = global.exportJobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Export job not found'
      });
    }

    // Delete file if exists
    if (job.filePath && await fs.access(job.filePath).then(() => true).catch(() => false)) {
      await fs.unlink(job.filePath);
    }

    // Remove job from memory
    global.exportJobs.delete(jobId);
    
    res.json({
      success: true,
      message: 'Export job deleted successfully'
    });
  } catch (error) {
    console.error('Delete export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting export job',
      error: error.message
    });
  }
};

/**
 * Process export job asynchronously
 */
const processExport = async (job) => {
  try {
    const exportData = {};
    let totalItems = 0;
    let processedItems = 0;

    // Calculate total items
    for (const contentType of job.contentTypes) {
      const count = await getContentCount(contentType, job.filters);
      totalItems += count;
    }

    job.totalItems = totalItems;

    // Process each content type
    for (const contentType of job.contentTypes) {
      const data = await exportContentType(contentType, job.filters, job.includeMedia);
      exportData[contentType] = data;
      processedItems += data.length;
      job.processedItems = processedItems;
      job.progress = Math.round((processedItems / totalItems) * 100);
    }

    // Format data based on export format
    const formattedData = await formatExportData(exportData, job.format);

    // Create export directory
    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Generate file path
    const extension = job.compress ? '.zip' : getFileExtension(job.format);
    const fileName = `${job.fileName}${extension}`;
    const filePath = path.join(exportDir, fileName);

    // Write file
    if (job.compress) {
      await createCompressedArchive(formattedData, filePath, job.format);
    } else {
      await fs.writeFile(filePath, formattedData);
    }

    // Update job status
    job.status = 'completed';
    job.completedAt = new Date();
    job.filePath = filePath;
    job.fileSize = (await fs.stat(filePath)).size;

  } catch (error) {
    console.error('Export process error:', error);
    job.status = 'failed';
    job.error = error.message;
    throw error;
  }
};

/**
 * Get content count for progress tracking
 */
const getContentCount = async (contentType, filters) => {
  const query = buildQuery(contentType, filters);
  
  switch (contentType) {
    case 'blogs':
      return await Blog.countDocuments(query);
    case 'sermons':
      return await Sermon.countDocuments(query);
    case 'events':
      return await Event.countDocuments(query);
    case 'users':
      return await User.countDocuments(query);
    case 'ministries':
      return await Ministry.countDocuments(query);
    case 'attendance':
      return await Attendance.countDocuments(query);
    case 'contacts':
      return await Contact.countDocuments(query);
    default:
      return 0;
  }
};

/**
 * Export specific content type
 */
const exportContentType = async (contentType, filters, includeMedia) => {
  const query = buildQuery(contentType, filters);
  const select = includeMedia ? {} : { media: 0, images: 0, documents: 0 };
  
  switch (contentType) {
    case 'blogs':
      return await Blog.find(query, select)
        .populate('author', 'firstName lastName email')
        .populate('moderatedBy', 'firstName lastName')
        .lean();
    case 'sermons':
      return await Sermon.find(query, select)
        .populate('createdBy', 'firstName lastName')
        .populate('moderatedBy', 'firstName lastName')
        .lean();
    case 'events':
      return await Event.find(query, select)
        .populate('createdBy', 'firstName lastName')
        .populate('attendees.user', 'firstName lastName email')
        .lean();
    case 'users':
      return await User.find(query, select)
        .select('-password')
        .lean();
    case 'ministries':
      return await Ministry.find(query, select)
        .populate('leaders.user', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email')
        .lean();
    case 'attendance':
      return await Attendance.find(query, select)
        .populate('user', 'firstName lastName email')
        .lean();
    case 'contacts':
      return await Contact.find(query, select).lean();
    default:
      return [];
  }
};

/**
 * Build query based on filters
 */
const buildQuery = (contentType, filters) => {
  const query = {};

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateFilter = getDateFilter(filters.dateRange, filters.customStartDate, filters.customEndDate);
    if (dateFilter) {
      query.createdAt = dateFilter;
    }
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  // Content type specific filters
  switch (contentType) {
    case 'blogs':
      if (filters.category) query.category = filters.category;
      if (filters.author) query.author = filters.author;
      break;
    case 'sermons':
      if (filters.category) query.category = filters.category;
      if (filters.speaker) query['speaker.name'] = { $regex: filters.speaker, $options: 'i' };
      break;
    case 'events':
      if (filters.category) query.category = filters.category;
      if (filters.type) query.type = filters.type;
      break;
    case 'users':
      if (filters.role) query.role = filters.role;
      if (filters.active !== undefined) query.active = filters.active;
      break;
    case 'ministries':
      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      break;
  }

  return query;
};

/**
 * Get date filter based on range
 */
const getDateFilter = (range, customStart, customEnd) => {
  const now = new Date();
  
  switch (range) {
    case 'last7days':
      return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case 'last30days':
      return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case 'last90days':
      return { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    case 'lastYear':
      return { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
    case 'custom':
      if (customStart && customEnd) {
        return {
          $gte: new Date(customStart),
          $lte: new Date(customEnd)
        };
      }
      break;
  }
  
  return null;
};

/**
 * Format export data based on format
 */
const formatExportData = async (data, format) => {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      return await formatToCSV(data);
    case 'xml':
      return await formatToXML(data);
    default:
      return JSON.stringify(data, null, 2);
  }
};

/**
 * Format data to CSV
 */
const formatToCSV = async (data) => {
  const csvData = {};
  
  for (const [contentType, items] of Object.entries(data)) {
    if (items.length === 0) continue;
    
    const fields = Object.keys(items[0]);
    const parser = new Parser({ fields });
    csvData[contentType] = parser.parse(items);
  }
  
  return csvData;
};

/**
 * Format data to XML
 */
const formatToXML = async (data) => {
  const builder = new xml2js.Builder({
    rootName: 'havenWordChurchExport',
    headless: true,
    renderOpts: { pretty: true, indent: '  ' }
  });
  
  const xmlData = {
    export: {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      content: data
    }
  };
  
  return builder.buildObject(xmlData);
};

/**
 * Create compressed archive
 */
const createCompressedArchive = async (data, filePath, format) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    
    archive.pipe(output);
    
    // Add files to archive
    for (const [contentType, content] of Object.entries(data)) {
      const fileName = `${contentType}.${format}`;
      const contentString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      archive.append(contentString, { name: fileName });
    }
    
    archive.finalize();
  });
};

/**
 * Get file extension for format
 */
const getFileExtension = (format) => {
  switch (format) {
    case 'json': return '.json';
    case 'csv': return '.csv';
    case 'xml': return '.xml';
    default: return '.json';
  }
};

/**
 * Estimate export time
 */
const estimateExportTime = (job) => {
  const baseTime = 30; // seconds
  const timePerItem = 0.1; // seconds per item
  const estimatedItems = job.contentTypes.length * 100; // rough estimate
  return Math.round(baseTime + (estimatedItems * timePerItem));
};

module.exports = {
  getExportOptions,
  createExport,
  getExportStatus,
  downloadExport,
  getExportHistory,
  deleteExport
}; 