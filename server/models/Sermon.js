const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 200 },
  description: { type: String, required: true, minlength: 10, maxlength: 1000 },
  scriptureReference: { type: String, required: true, minlength: 3, maxlength: 200 },
  keyVerse: { type: String, maxlength: 500 },
  series: {
    name: { type: String, maxlength: 150 },
    part: { type: Number, min: 1 },
    totalParts: { type: Number, min: 1 }
  },
  speaker: {
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    title: { type: String, maxlength: 100 },
    bio: { type: String, maxlength: 500 },
    isGuestSpeaker: { type: Boolean, default: false }
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Sunday Service',
      'Midweek Service',
      'Prayer Meeting',
      'Youth Service',
      'Women Fellowship',
      'Men Fellowship',
      'Special Service',
      'Conference',
      'Retreat'
    ]
  },
  serviceDate: { type: Date, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Teaching',
      'Evangelistic',
      'Prophetic',
      'Pastoral',
      'Worship',
      'Prayer',
      'Testimony',
      'Special Occasion'
    ]
  },
  media: {
    audio: {
      url: { type: String },
      duration: { type: Number, min: 0 },
      fileSize: { type: Number, min: 0 },
      format: { type: String, enum: ['mp3', 'wav', 'm4a'] }
    },
    video: {
      url: { type: String },
      thumbnailUrl: { type: String },
      duration: { type: Number, min: 0 },
      fileSize: { type: Number, min: 0 },
      format: { type: String, enum: ['mp4', 'webm', 'avi'] },
      quality: { type: String, enum: ['360p', '480p', '720p', '1080p'] }
    },
    transcript: {
      url: { type: String },
      format: { type: String, enum: ['pdf', 'doc', 'docx', 'txt'] }
    },
    slides: {
      url: { type: String },
      format: { type: String, enum: ['pdf', 'ppt', 'pptx'] }
    }
  },
  tags: [{ type: String, maxlength: 30 }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'private'],
    default: 'draft'
  },
  isFeatured: { type: Boolean, default: false },
  featuredImageUrl: { type: String },
  metaDescription: { type: String, maxlength: 160 },
  analytics: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
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
}, { timestamps: true });

module.exports = mongoose.model('Sermon', sermonSchema);
