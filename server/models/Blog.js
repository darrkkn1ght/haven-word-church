const mongoose = require('mongoose');

/**
 * Blog Post Schema for Haven Word Church
 * Handles church blog posts, articles, testimonies, and announcements
 * Supports Nigerian timezone and local context
 */
const blogSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  
  authorRole: {
    type: String,
    trim: true,
    default: 'Member'
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'sermon-notes',
      'testimony',
      'announcement',
      'devotional',
      'church-news',
      'community-outreach',
      'youth-ministry',
      'women-ministry',
      'men-ministry',
      'children-ministry',
      'prayer-request',
      'missions',
      'bible-study',
      'fellowship',
      'general'
    ],
    default: 'general'
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Media
  featuredImage: {
    url: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    }
  },
  
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    }
  }],
  
  // Publishing Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'scheduled'],
    default: 'draft'
  },
  
  publishedAt: {
    type: Date,
    default: null
  },
  
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Visibility & Access
  visibility: {
    type: String,
    enum: ['public', 'members-only', 'leadership-only'],
    default: 'public'
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  pinned: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    approved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Scripture References
  scriptureReferences: [{
    book: {
      type: String,
      trim: true
    },
    chapter: {
      type: Number,
      min: 1
    },
    verse: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      default: 'NIV',
      trim: true
    },
    text: {
      type: String,
      trim: true
    }
  }],
  
  // Nigerian/Local Context
  location: {
    city: {
      type: String,
      trim: true,
      default: 'Lagos'
    },
    state: {
      type: String,
      trim: true,
      default: 'Lagos State'
    },
    country: {
      type: String,
      trim: true,
      default: 'Nigeria'
    }
  },
  
  language: {
    type: String,
    enum: ['english', 'yoruba', 'igbo', 'hausa', 'pidgin'],
    default: 'english'
  },
  
  // SEO
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  metaKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Analytics
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  
  wordCount: {
    type: Number,
    default: 0
  },
  
  // Moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderatedAt: {
    type: Date
  },
  
  moderationNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ featured: 1, pinned: 1 });
blogSchema.index({ visibility: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'location.city': 1, 'location.state': 1 });
blogSchema.index({ createdAt: -1 });

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.filter(comment => comment.approved).length : 0;
});

// Virtual for formatted publish date (Nigerian timezone)
blogSchema.virtual('formattedPublishDate').get(function() {
  if (this.publishedAt) {
    return this.publishedAt.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Lagos'
    });
  }
  return null;
});

// Virtual for blog URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  // Set published date if status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate meta description from excerpt if not provided
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.substring(0, 160);
  }
  
  // Set author name from populated author
  if (this.isModified('author') && this.populated('author')) {
    this.authorName = this.author.firstName + ' ' + this.author.lastName;
    this.authorRole = this.author.role || 'Member';
  }
  
  next();
});

// Static methods
blogSchema.statics.findPublished = function() {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

blogSchema.statics.findByCategory = function(category) {
  return this.find({
    category: category,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

blogSchema.statics.findFeatured = function() {
  return this.find({
    featured: true,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

blogSchema.statics.search = function(query) {
  return this.find({
    $and: [
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      },
      { status: 'published' },
      { publishedAt: { $lte: new Date() } }
    ]
  }).sort({ publishedAt: -1 });
};

// Instance methods
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

blogSchema.methods.addComment = function(userId, userName, content) {
  this.comments.push({
    user: userId,
    userName: userName,
    content: content,
    approved: false // Comments need approval by default
  });
  return this.save();
};

blogSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    this.likes = this.likes.filter(like => 
      like.user.toString() !== userId.toString()
    );
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

blogSchema.methods.approve = function(moderatorId, notes = '') {
  this.moderationStatus = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationNotes = notes;
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);