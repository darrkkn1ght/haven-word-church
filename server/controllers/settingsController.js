const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../utils/activityLogger');

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        churchName: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Handle file upload (logo)
    if (req.file) {
      // Remove old logo if exists
      if (settings.logo && fs.existsSync(path.join(__dirname, '../uploads/images/', settings.logo))) {
        fs.unlinkSync(path.join(__dirname, '../uploads/images/', settings.logo));
      }
      settings.logo = req.file.filename;
    }

    // Update other fields
    Object.keys(req.body).forEach((key) => {
      settings[key] = req.body[key];
    });

    await settings.save();
    await logActivity({ user: req.user?._id, action: 'settings_change', targetType: 'Settings', status: 'success', ip: req.ip, userAgent: req.get('User-Agent') });
    res.json(settings);
  } catch (err) {
    await logActivity({ user: req.user?._id, action: 'settings_change', targetType: 'Settings', status: 'failure', ip: req.ip, userAgent: req.get('User-Agent'), error: err.message });
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
};
