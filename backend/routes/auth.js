const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const Profile = require('../models/Profile');

// --- DEMO MODE STORAGE ---
let demoUsers = []; 
let demoProfiles = [];
const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_123';

const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide name, email and password' });
    }

    const qrId = nanoid(10);

    // 1. If DB is connected
    if (global.isDbConnected) {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });

      user = new User({ name, email, phone, password });
      await user.save();

      // Create Profile
      const profile = new Profile({ user: user.id, qrId });
      await profile.save();

      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, name, email, phone, qrId } });
    } 

    // 2. Demo fallback
    const existing = demoUsers.find(u => u.email === email);
    if (existing) return res.status(400).json({ msg: 'User already exists (Demo Mode)' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    const newUser = { id: userId, name, email, phone, password: hashedPassword };
    demoUsers.push(newUser);

    const newProfile = { user: userId, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0 };
    demoProfiles.push(newProfile);

    const token = generateToken(userId);
    res.json({ token, user: { id: userId, name, email, phone, qrId } });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'All fields required' });

    if (global.isDbConnected) {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

      const profile = await Profile.findOne({ user: user.id });

      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, qrId: profile?.qrId } });
    }

    const user = demoUsers.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const profile = demoProfiles.find(p => p.user === user.id);

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, qrId: profile?.qrId } });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (global.isDbConnected) {
      const user = await User.findById(decoded.user.id).select('-password').lean();
      const profile = await Profile.findOne({ user: decoded.user.id }).lean();
      return res.json({ ...user, qrId: profile?.qrId });
    }

    const user = demoUsers.find(u => u.id === decoded.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const profile = demoProfiles.find(p => p.user === user.id);
    
    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, qrId: profile?.qrId });
  } catch (err) {
    res.status(401).json({ msg: 'Session expired' });
  }
});

// EXPORT DEMO DATA FOR OTHER ROUTES
router.getDemoProfiles = () => demoProfiles;

module.exports = router;
