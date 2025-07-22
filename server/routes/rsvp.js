const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// RSVP Mongoose model (define inline for now)
const RSVP = mongoose.models.RSVP || mongoose.model('RSVP', new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  attendance: String,
  guestCount: Number,
  guests: Array,
  dietaryRestrictions: String,
  accessibilityNeeds: String,
  transportation: String,
  pickupLocation: String,
  volunteer: Boolean,
  volunteerAreas: Array,
  comments: String,
  emergencyContact: String,
  emergencyPhone: String,
  newsletter: Boolean,
  eventId: String,
  eventTitle: String,
  date: String,
  time: String,
  location: String,
  timestamp: String,
  source: String,
  totalAttendees: Number
}));

// Google Sheets setup
const SHEETS_CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_CREDENTIALS;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
async function getSheetsClient() {
  const credentials = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', SHEETS_CREDENTIALS_PATH), 'utf8')
  );
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
async function appendRSVPToSheet(rsvpData) {
  const sheets = await getSheetsClient();
  const values = [[
    new Date().toLocaleString(),
    rsvpData.firstName,
    rsvpData.lastName,
    rsvpData.email,
    rsvpData.phone,
    rsvpData.eventTitle || '',
    rsvpData.date || '',
    rsvpData.time || '',
    rsvpData.location || '',
    rsvpData.attendance || '',
    rsvpData.guestCount || 0,
    rsvpData.comments || '',
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// RSVP endpoint
router.post('/', async (req, res) => {
  try {
    // 1. Save to MongoDB
    const rsvp = new RSVP(req.body);
    await rsvp.save();

    // 2. Append to Google Sheets
    await appendRSVPToSheet(req.body);

    // 3. Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself; add req.body.email to send to user too
      subject: `New RSVP: ${req.body.firstName} ${req.body.lastName}`,
      text: `New RSVP received:\n\n${JSON.stringify(req.body, null, 2)}`,
      html: `<h2>New RSVP Received</h2><pre>${JSON.stringify(req.body, null, 2)}</pre>`
    });

    res.status(201).json({ message: 'RSVP submitted successfully!' });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ message: 'Failed to submit RSVP.' });
  }
});

module.exports = router; 