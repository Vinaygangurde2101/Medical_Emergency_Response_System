const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const authRouter = require('./auth');

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_123';

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const { nanoid } = require('nanoid');

// @route   GET api/patient/summary
router.get('/summary', auth, async (req, res) => {
  try {
    if (global.isDbConnected) {
      try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
          const qrId = req.user?.qrId || nanoid(10);
          profile = new Profile({ user: req.user.id, qrId });
          await profile.save();
        }
        return res.json(profile);
      } catch (dbErr) {
        console.warn('DB profile fetch in /summary skipped, using fallback:', dbErr.message);
      }
    }

    const demoProfiles = authRouter.getDemoProfiles();
    let profile = demoProfiles.find(p => p.user === req.user.id);
    if (!profile) {
      const qrId = req.user?.qrId || ('demo_' + nanoid(8));
      profile = { user: req.user.id, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true };
      demoProfiles.push(profile);
    }
    res.json(profile);
  } catch (err) {
    console.error("Error in /summary:", err);
    res.json({
      user: req.user?.id || 'demo_user',
      qrId: req.user?.qrId || 'demo_qr_01',
      bloodGroup: '',
      allergies: [],
      medications: [],
      diseases: [],
      emergencyContacts: [],
      scansCount: 0,
      isQrActive: true
    });
  }
});

// @route   PUT api/patient/update
router.put('/update', auth, async (req, res) => {
  try {
    const updateData = req.body;
    
    if (global.isDbConnected) {
      let profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        const qrId = nanoid(10);
        profile = new Profile({ user: req.user.id, qrId, ...updateData });
        await profile.save();
      } else {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: updateData },
          { new: true }
        );
      }
      return res.json(profile);
    }

    const demoProfiles = authRouter.getDemoProfiles();
    let index = demoProfiles.findIndex(p => p.user === req.user.id);
    if (index === -1) {
      const qrId = 'demo_' + nanoid(8);
      const newP = { user: req.user.id, qrId, bloodGroup: '', allergies: [], medications: [], diseases: [], emergencyContacts: [], scansCount: 0, isQrActive: true, ...updateData };
      demoProfiles.push(newP);
      return res.json(newP);
    }

    demoProfiles[index] = { ...demoProfiles[index], ...updateData };
    res.json(demoProfiles[index]);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
