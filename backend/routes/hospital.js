const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Hospital = require('../models/Hospital');
const AccessLog = require('../models/AccessLog');
const { authMiddleware, checkRole, JWT_SECRET } = require('../middleware/authMiddleware');
const authRouter = require('./auth');

// @route   POST api/hospital/login
// @desc    Hospital staff login & authorization check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    if (global.isDbConnected) {
      const user = await User.findOne({ email }).populate('hospital');
      if (!user) return res.status(400).json({ msg: 'Invalid Hospital Staff Credentials' });

      if (user.role !== 'HOSPITAL_STAFF' && user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Account is not authorized as Hospital Staff' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

      // Check hospital verification status
      if (user.hospital && user.hospital.isApproved === false) {
        return res.status(403).json({ msg: 'Hospital account is pending verification/approval by Admin.' });
      }

      const token = jwt.sign(
        { 
          user: { 
            id: user._id, 
            name: user.name,
            role: user.role, 
            hospitalId: user.hospital?._id,
            hospitalName: user.hospital?.name || 'Authorized Emergency Medical Center'
          } 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hospitalName: user.hospital?.name || 'Authorized Hospital Center'
        }
      });
    }

    // DEMO MODE HOSPITAL LOGIN FALLBACK
    if (email === 'hospital@mers.com' && password === 'hospital123') {
      const token = jwt.sign(
        { user: { id: 'demo_hospital_staff_id', name: 'Dr. Sarah Connor', role: 'HOSPITAL_STAFF', hospitalName: 'City General Emergency Hospital' } },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: {
          id: 'demo_hospital_staff_id',
          name: 'Dr. Sarah Connor',
          email: 'hospital@mers.com',
          role: 'HOSPITAL_STAFF',
          hospitalName: 'City General Emergency Hospital'
        }
      });
    }

    return res.status(400).json({ msg: 'Invalid Credentials (Demo Mode: use hospital@mers.com / hospital123)' });

  } catch (err) {
    console.error('Hospital login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/hospital/patient-profile/:qrId
// @desc    Full Medical Record Access for Authenticated Verified Hospital Staff
router.get('/patient-profile/:qrId', authMiddleware, checkRole(['HOSPITAL_STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { qrId } = req.params;

    if (global.isDbConnected) {
      const profile = await Profile.findOne({ qrId }).populate('user', 'name email phone');
      if (!profile) return res.status(404).json({ msg: 'Patient Medical Profile not found' });

      // Audit Log Access Event
      await AccessLog.create({
        patient: profile.user?._id,
        qrId,
        accessType: 'VERIFIED_HOSPITAL_ACCESS',
        accessorRole: req.user.role,
        hospital: req.user.hospitalId,
        hospitalName: req.user.hospitalName || 'Verified Emergency Hospital',
        staffName: req.user.name || 'Emergency Medical Officer',
        actionDetails: 'Full Medical Record & History Access'
      });

      return res.json({
        qrId: profile.qrId,
        patientName: profile.user?.name,
        contactPhone: profile.user?.phone,
        bloodGroup: profile.bloodGroup || 'Not Specified',
        allergies: profile.allergies || [],
        medications: profile.medications || [],
        diseases: profile.diseases || [],
        medicalHistory: profile.medicalHistory || [],
        emergencyContacts: profile.emergencyContacts || [],
        scansCount: profile.scansCount,
        verifiedAccessTime: new Date()
      });
    }

    // DEMO MODE
    const demoProfiles = authRouter.getDemoProfiles();
    const profile = demoProfiles.find(p => p.qrId === qrId);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    res.json({
      qrId: profile.qrId,
      patientName: 'John Doe (Demo Patient)',
      contactPhone: '+91 98765 43210',
      bloodGroup: profile.bloodGroup || 'O+',
      allergies: profile.allergies.length ? profile.allergies : ['Penicillin', 'Peanuts'],
      medications: profile.medications.length ? profile.medications : ['Aspirin 75mg daily', 'Metformin 500mg'],
      diseases: profile.diseases.length ? profile.diseases : ['Type 2 Diabetes', 'Hypertension'],
      medicalHistory: ['Appendectomy 2021', 'Cardiac Stent 2023'],
      emergencyContacts: [
        { name: 'Jane Doe', relation: 'Spouse', phone: '+91 98765 00001' }
      ],
      scansCount: profile.scansCount + 1,
      verifiedAccessTime: new Date()
    });

  } catch (err) {
    console.error('Hospital profile fetch error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
