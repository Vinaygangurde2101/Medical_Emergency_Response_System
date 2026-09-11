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

// @route   GET api/patient/summary
router.get('/summary', auth, async (req, res) => {
  try {
    if (global.isDbConnected) {
      const profile = await Profile.findOne({ user: req.user.id });
      return res.json(profile);
    }

    const demoProfiles = authRouter.getDemoProfiles();
    const profile = demoProfiles.find(p => p.user === req.user.id);
    res.json(profile);
  } catch (err) {
    console.error("Error in /summary:", err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/patient/update
router.put('/update', auth, async (req, res) => {
  try {
    const updateData = req.body;
    
    if (global.isDbConnected) {
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: updateData },
        { new: true }
      );
      return res.json(profile);
    }

    const demoProfiles = authRouter.getDemoProfiles();
    const index = demoProfiles.findIndex(p => p.user === req.user.id);
    if (index === -1) return res.status(404).json({ msg: 'Profile not found' });

    demoProfiles[index] = { ...demoProfiles[index], ...updateData };
    res.json(demoProfiles[index]);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
