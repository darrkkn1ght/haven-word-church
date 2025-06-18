const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  churchName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  address: { type: String, required: true },
  website: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  youtube: { type: String },
  vision: { type: String },
  mission: { type: String },
  serviceTimes: { type: String },
  mapsLink: { type: String },
  welcomeMessage: { type: String },
  logo: { type: String }, // URL or path to uploaded logo
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
