const mongoose = require('mongoose');

const SpiritualGrowthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bibleReadingDays: {
    type: Number,
    default: 0
  },
  devotionalsCompleted: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Add more fields as needed for your church's growth metrics
});

module.exports = mongoose.model('SpiritualGrowth', SpiritualGrowthSchema);
