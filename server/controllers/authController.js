const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ name, email, password, role });
    await user.save();
    await logActivity({ user: user._id, action: 'registration', status: 'success', ip: req.ip, userAgent: req.get('User-Agent') });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    await logActivity({ user: null, action: 'registration', status: 'failure', ip: req.ip, userAgent: req.get('User-Agent'), error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      await logActivity({ user: null, action: 'login', status: 'failure', ip: req.ip, userAgent: req.get('User-Agent'), error: 'Invalid credentials' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await logActivity({ user: user._id, action: 'login', status: 'success', ip: req.ip, userAgent: req.get('User-Agent') });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    await logActivity({ user: null, action: 'login', status: 'failure', ip: req.ip, userAgent: req.get('User-Agent'), error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};
