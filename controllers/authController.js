// Check authentication status
exports.checkAuth = (req, res) => {
  // This endpoint uses the requireAuth middleware, so if we reach here, user is authenticated
  res.json({ 
    authenticated: true, 
    user: { 
      id: req.user.id, 
      email: req.user.email 
    } 
  });
};

// Logout (clear cookie)
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  res.json({ success: true });
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      bookingHistory: [],
      cancellations: 0,
    });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
      path: '/'
    });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
      path: '/'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};
