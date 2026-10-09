const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const Profile = require('../models/Profile');

// --- DEMO MODE STORAGE ---
let demoUsers = [
  {
    id: 'user_demo_1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    password: bcrypt.hashSync('password123', 10),
    role: 'PATIENT'
  },
  {
    id: 'user_demo_2',
    name: 'Anita Roy',
    email: 'anita@example.com',
    phone: '+91 99887 76655',
    password: bcrypt.hashSync('password123', 10),
    role: 'PATIENT'
  }
]; 

let demoProfiles = [
  {
    user: 'user_demo_1',
    qrId: 'demo_qr_01',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Aspirin 75mg daily'],
    diseases: ['Hypertension'],
    emergencyContacts: [{ name: 'Jane Doe', relation: 'Spouse', phone: '+91 98765 43210' }],
    scansCount: 5,
    isQrActive: true
  },
  {
    user: 'user_demo_2',
    qrId: 'demo_qr_02',
    bloodGroup: 'B+',
    allergies: ['Sulfa Drugs'],
    medications: ['Metformin 500mg'],
    diseases: ['Type 2 Diabetes'],
    emergencyContacts: [{ name: 'Ramesh Roy', relation: 'Father', phone: '+91 91234 56789' }],
    scansCount: 2,
    isQrActive: true
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_123';

const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email: rawEmail, phone, password } = req.body;
    
    if (!name || !rawEmail || !password) {
      return res.status(400).json({ msg: 'Please provide name, email and password' });
    }

    const email = rawEmail.trim().toLowerCase();
    const qrId = nanoid(10);

    // 1. If DB is connected
    if (global.isDbConnected) {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists with this email' });

      user = new User({ name, email, phone, password, role: 'PATIENT' });
      await user.save();

      // Create Profile
      const profile = new Profile({ user: user.id, qrId });
      await profile.save();

      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, name, email, phone, role: 'PATIENT', qrId } });
    } 

    // 2. Demo fallback
    const existing = demoUsers.find(u => u.email.toLowerCase() === email);
    if (existing) return res.status(400).json({ msg: 'User already exists with this email (Demo Mode)' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user_demo_' + Date.now();
    const newUser = { id: userId, name, email, phone, password: hashedPassword, role: 'PATIENT' };
    demoUsers.push(newUser);

    const newProfile = { user: userId, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true };
    demoProfiles.push(newProfile);

    const token = generateToken(userId);
    res.json({ token, user: { id: userId, name, email, phone, role: 'PATIENT', qrId } });

  } catch (err) {
    console.error('Register Error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'An account with this email address already exists' });
    }
    res.status(500).json({ msg: err.message || 'Registration failed due to a server error' });
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) return res.status(400).json({ msg: 'Email and password required' });

    const email = rawEmail.trim().toLowerCase();

    // DEMO ADMIN CREDS FALLBACK
    if (email === 'admin@mers.com' && password === 'admin123') {
      const token = generateToken('demo_admin_id');
      return res.json({ 
        token, 
        user: { 
          id: 'demo_admin_id', 
          name: 'System Executive Admin', 
          email: 'admin@mers.com', 
          phone: '+91 99999 00000', 
          role: 'ADMIN',
          qrId: 'ADMIN_QR' 
        } 
      });
    }

    if (global.isDbConnected) {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

      let profile = await Profile.findOne({ user: user.id });
      if (!profile && (user.role === 'PATIENT' || !user.role)) {
        const qrId = nanoid(10);
        profile = new Profile({ user: user.id, qrId });
        await profile.save();
      }

      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'PATIENT', qrId: profile?.qrId } });
    }

    const user = demoUsers.find(u => u.email.toLowerCase() === email);
    if (!user) return res.status(400).json({ msg: 'User account not found with this email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    let profile = demoProfiles.find(p => p.user === user.id);
    if (!profile) {
      const qrId = 'demo_' + nanoid(8);
      profile = { user: user.id, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true };
      demoProfiles.push(profile);
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'PATIENT', qrId: profile?.qrId } });

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
    
    if (decoded.user?.id === 'demo_admin_id') {
      return res.json({
        id: 'demo_admin_id',
        name: 'System Executive Admin',
        email: 'admin@mers.com',
        phone: '+91 99999 00000',
        role: 'ADMIN',
        qrId: 'ADMIN_QR'
      });
    }

    if (global.isDbConnected) {
      const user = await User.findById(decoded.user.id).select('-password').lean();
      if (!user) return res.status(404).json({ msg: 'User not found' });
      
      let profile = await Profile.findOne({ user: decoded.user.id }).lean();
      if (!profile && (user.role === 'PATIENT' || !user.role)) {
        const qrId = nanoid(10);
        const newProfile = new Profile({ user: user._id, qrId });
        await newProfile.save();
        profile = newProfile.toObject();
      }

      return res.json({ ...user, id: user._id, qrId: profile?.qrId });
    }

    const user = demoUsers.find(u => u.id === decoded.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    let profile = demoProfiles.find(p => p.user === user.id);
    if (!profile) {
      const qrId = 'demo_' + nanoid(8);
      profile = { user: user.id, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true };
      demoProfiles.push(profile);
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, role: user.role || 'PATIENT', qrId: profile?.qrId });
  } catch (err) {
    res.status(401).json({ msg: 'Session expired' });
  }
});

// EXPORT DEMO DATA FOR OTHER ROUTES
router.getDemoProfiles = () => demoProfiles;

module.exports = router;
