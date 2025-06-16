const Blog = require('../models/Blog');
const User = require('../models/User');

/**
 * Blog Controller for Haven Word Church
 * Handles all blog-related operations including CRUD, search, engagement
 * Supports Nigerian/local context and church-specific features
 */

/**
 * Get all published blogs with pagination and filtering
 * @route GET /api/blogs
 * @access Public
 */
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {
      status: 'published',
      publishedAt: { $lte: new Date() }
    };
    
    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Add visibility filter based on user status
    if (!req.user) {
      filter.visibility = 'public';
    } else if (req.user.role !== 'admin' && req.user.role !== 'pastor' && req.user.role !== 'leader') {
      filter.visibility = { $in: ['public', 'members-only'] };
    }
    
    // Add featured filter if requested
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    // Add language filter if provided
    if (req.query.language) {
      filter.language = req.query.language;
    }
    
    const blogs = await Blog.find(filter)
      .populate('author', 'firstName lastName role profilePicture')
      .select('-content') // Exclude full content for list view
      .sort({ pinned: -1, publishedAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

/**
 * Get single blog by slug
 * @route GET /api/blogs/:slug
 * @access Public/Members (based on visibility)
 */
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug })
      .populate('author', 'firstName lastName role profilePicture bio')
      .populate('comments.user', 'firstName lastName profilePicture');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Check visibility permissions
    if (blog.visibility === 'members-only' && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Members only content. Please log in.'
      });
    }
    
    if (blog.visibility === 'leadership-only' && 
        (!req.user || !['admin', 'pastor', 'leader'].includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Leadership only content'
      });
    }
    
    // Check if published (unless user is author or admin)
    if (blog.status !== 'published' && 
        (!req.user || (req.user._id.toString() !== blog.author._id.toString() && 
         !['admin', 'pastor'].includes(req.user.role)))) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Increment views (don't wait for completion)
    blog.incrementViews().catch(err => console.error('View increment error:', err));
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
};

/**
 * Create new blog post
 * @route POST /api/blogs
 * @access Private (Members+)
 */
const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      authorRole: req.user.role || 'Member'
    };
    
    // Auto-approve if admin/pastor, otherwise pending moderation
    if (['admin', 'pastor'].includes(req.user.role)) {
      blogData.moderationStatus = 'approved';
      blogData.moderatedBy = req.user._id;
      blogData.moderatedAt = new Date();
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'firstName lastName role profilePicture');
    
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
      error: error.message
    });
  }
};

/**
 * Update blog post
 * @route PUT /api/blogs/:id
 * @access Private (Author/Admin/Pastor)
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Check permissions
    const isAuthor = blog.author.toString() === req.user._id.toString();
    const isAuthorized = isAuthor || ['admin', 'pastor'].includes(req.user.role);
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post'
      });
    }
    
    // If not admin/pastor and blog is published, reset to pending moderation
    if (!['admin', 'pastor'].includes(req.user.role) && blog.status === 'published') {
      req.body.moderationStatus = 'pending';
      req.body.moderatedBy = undefined;
      req.body.moderatedAt = undefined;
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName role profilePicture');
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error.message
    });
  }
};

/**
 * Delete blog post
 * @route DELETE /api/blogs/:id
 * @access Private (Author/Admin/Pastor)
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Check permissions
    const isAuthor = blog.author.toString() === req.user._id.toString();
    const isAuthorized = isAuthor || ['admin', 'pastor'].includes(req.user.role);
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post'
      });
    }
    
    await Blog.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    });
  }
};

/**
 * Search blogs
 * @route GET /api/blogs/search
 * @access Public
 */
const searchBlogs = async (req, res) => {
  try {
    const { q, category, language, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search filter
    let searchFilter = {
      $and: [
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
            { excerpt: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        },
        { status: 'published' },
        { publishedAt: { $lte: new Date() } }
      ]
    };
    
    // Add visibility filter
    if (!req.user) {
      searchFilter.$and.push({ visibility: 'public' });
    } else if (!['admin', 'pastor', 'leader'].includes(req.user.role)) {
      searchFilter.$and.push({ visibility: { $in: ['public', 'members-only'] } });
    }
    
    // Add optional filters
    if (category) {
      searchFilter.$and.push({ category });
    }
    
    if (language) {
      searchFilter.$and.push({ language });
    }
    
    const blogs = await Blog.find(searchFilter)
      .populate('author', 'firstName lastName role profilePicture')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Blog.countDocuments(searchFilter);
    
    res.json({
      success: true,
      data: {
        blogs,
        total,
        query: q,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: skip + blogs.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching blogs',
      error: error.message
    });
  }
};

/**
 * Get featured blogs
 * @route GET /api/blogs/featured
 * @access Public
 */
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const filter = {
      featured: true,
      status: 'published',
      publishedAt: { $lte: new Date() }
    };
    
    // Add visibility filter
    if (!req.user) {
      filter.visibility = 'public';
    } else if (!['admin', 'pastor', 'leader'].includes(req.user.role)) {
      filter.visibility = { $in: ['public', 'members-only'] };
    }
    
    const blogs = await Blog.find(filter)
      .populate('author', 'firstName lastName role profilePicture')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured blogs',
      error: error.message
    });
  }
};

/**
 * Get blogs by category
 * @route GET /api/blogs/category/:category
 * @access Public
 */
const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {
      category,
      status: 'published',
      publishedAt: { $lte: new Date() }
    };
    
    // Add visibility filter
    if (!req.user) {
      filter.visibility = 'public';
    } else if (!['admin', 'pastor', 'leader'].includes(req.user.role)) {
      filter.visibility = { $in: ['public', 'members-only'] };
    }
    
    const blogs = await Blog.find(filter)
      .populate('author', 'firstName lastName role profilePicture')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Blog.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        blogs,
        category,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get blogs by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs by category',
      error: error.message
    });
  }
};

/**
 * Add comment to blog
 * @route POST /api/blogs/:id/comments
 * @access Private (Members+)
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    await blog.addComment(
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`,
      content.trim()
    );
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully (pending approval)'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * Toggle like on blog
 * @route POST /api/blogs/:id/like
 * @access Private (Members+)
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    await blog.toggleLike(req.user._id);
    
    res.json({
      success: true,
      message: 'Like toggled successfully',
      data: {
        likeCount: blog.likeCount
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

/**
 * Get user's blogs (for dashboard)
 * @route GET /api/blogs/my-blogs
 * @access Private
 */
const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.find({ author: req.user._id })
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Blog.countDocuments({ author: req.user._id });
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your blogs',
      error: error.message
    });
  }
};

/**
 * Moderate blog (Admin/Pastor only)
 * @route PATCH /api/blogs/:id/moderate
 * @access Private (Admin/Pastor)
 */
const moderateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve', 'reject', 'flag'
    
    if (!['admin', 'pastor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to moderate blogs'
      });
    }
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged'
    };
    
    blog.moderationStatus = statusMap[action] || 'pending';
    blog.moderatedBy = req.user._id;
    blog.moderatedAt = new Date();
    blog.moderationNotes = notes || '';
    
    await blog.save();
    
    res.json({
      success: true,
      message: `Blog post ${action}d successfully`,
      data: blog
    });
  } catch (error) {
    console.error('Moderate blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating blog post',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  addComment,
  toggleLike,
  getMyBlogs,
  moderateBlog
};