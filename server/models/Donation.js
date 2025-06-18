const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Tithe', 'Offering', 'Building Fund', 'Missions', 'Other'], default: 'Offering' },
  method: { type: String, default: 'Bank Transfer' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
