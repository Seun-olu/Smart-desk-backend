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
    res.status(201).json({ token });
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
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};
