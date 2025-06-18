const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'praying', 'answered', 'archived'], default: 'pending' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
