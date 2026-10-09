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

const generateToken = (userObj) => {
  const payload = {
    user: {
      id: userObj.id || userObj._id,
      name: userObj.name || 'User',
      email: userObj.email || '',
      phone: userObj.phone || '',
      role: userObj.role || 'PATIENT',
      qrId: userObj.qrId || 'demo_qr_01'
    }
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email: rawEmail, phone, password } = req.body;
    
    if (!name || !rawEmail || !password) {
      return res.status(400).json({ msg: 'Please provide name, email and password' });
    }

    const email = rawEmail.trim().toLowerCase();
    const cleanPhone = (phone && phone.trim()) ? phone.trim() : '+91 98765 43210';
    const qrId = nanoid(10);

    // 1. If DB is connected
    if (global.isDbConnected) {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists with this email' });

      user = new User({ name, email, phone: cleanPhone, password, role: 'PATIENT' });
      await user.save();

      // Create Profile
      const profile = new Profile({ user: user.id, qrId });
      await profile.save();

      const userPayload = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: 'PATIENT', qrId };
      const token = generateToken(userPayload);
      return res.json({ token, user: userPayload });
    } 

    // 2. Demo / Serverless fallback
    const existing = demoUsers.find(u => u.email.toLowerCase() === email);
    if (existing) return res.status(400).json({ msg: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user_demo_' + Date.now();
    const newUser = { id: userId, name, email, phone: cleanPhone, password: hashedPassword, role: 'PATIENT' };
    demoUsers.push(newUser);

    const newProfile = { user: userId, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true };
    demoProfiles.push(newProfile);

    const userPayload = { id: userId, name, email, phone: cleanPhone, role: 'PATIENT', qrId };
    const token = generateToken(userPayload);
    res.json({ token, user: userPayload });

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
      const adminUser = { 
        id: 'demo_admin_id', 
        name: 'System Executive Admin', 
        email: 'admin@mers.com', 
        phone: '+91 99999 00000', 
        role: 'ADMIN',
        qrId: 'ADMIN_QR' 
      };
      const token = generateToken(adminUser);
      return res.json({ token, user: adminUser });
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

      const userPayload = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'PATIENT', qrId: profile?.qrId };
      const token = generateToken(userPayload);
      return res.json({ token, user: userPayload });
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

    const userPayload = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'PATIENT', qrId: profile?.qrId };
    const token = generateToken(userPayload);
    res.json({ token, user: userPayload });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const tokenUser = decoded.user || {};
    
    if (tokenUser.id === 'demo_admin_id') {
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
      try {
        const user = await User.findById(tokenUser.id).select('-password').lean();
        if (user) {
          let profile = await Profile.findOne({ user: user._id }).lean();
          if (!profile && (user.role === 'PATIENT' || !user.role)) {
            const qrId = nanoid(10);
            const newProfile = new Profile({ user: user._id, qrId });
            await newProfile.save();
            profile = newProfile.toObject();
          }
          return res.json({ ...user, id: user._id, qrId: profile?.qrId });
        }
      } catch (dbErr) {
        console.warn('DB lookup in /me skipped, using JWT payload');
      }
    }

    // In-Memory or Serverless JWT Fallback
    const user = demoUsers.find(u => u.id === tokenUser.id);
    let profile = user ? demoProfiles.find(p => p.user === user.id) : null;

    const responseUser = {
      id: tokenUser.id || 'user_demo_1',
      name: user?.name || tokenUser.name || 'Emergency Patient',
      email: user?.email || tokenUser.email || 'patient@example.com',
      phone: user?.phone || tokenUser.phone || '+91 98765 43210',
      role: user?.role || tokenUser.role || 'PATIENT',
      qrId: profile?.qrId || tokenUser.qrId || 'demo_qr_01'
    };
    
    res.json(responseUser);
  } catch (err) {
    res.status(401).json({ msg: 'Session expired' });
  }
});

// EXPORT DEMO DATA FOR OTHER ROUTES
router.getDemoProfiles = () => demoProfiles;

module.exports = router;
