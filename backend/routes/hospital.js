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

// @route   POST api/hospital/register
// @desc    Register a new hospital (Starts as Pending Admin Approval)
router.post('/register', async (req, res) => {
  try {
    const { name, licenseNumber, city, address, contactPhone, email, password, doctorName } = req.body;
    if (!name || !licenseNumber || !city || !address || !contactPhone || !email || !password) {
      return res.status(400).json({ msg: 'Please fill in all hospital registration fields' });
    }

    if (global.isDbConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ msg: 'Email is already registered' });

      const existingHosp = await Hospital.findOne({ $or: [{ email }, { licenseNumber }] });
      if (existingHosp) return res.status(400).json({ msg: 'Hospital with this license or email already exists' });

      // Create Hospital with isApproved: false (Pending Admin Verification)
      const hospital = new Hospital({
        name,
        licenseNumber,
        city,
        address,
        contactPhone,
        email,
        isApproved: false
      });
      await hospital.save();

      // Create Hospital Staff User
      const user = new User({
        name: doctorName || `Dr. Staff (${name})`,
        email,
        phone: contactPhone,
        password,
        role: 'HOSPITAL_STAFF',
        hospital: hospital._id
      });
      await user.save();

      return res.json({
        success: true,
        msg: 'Hospital registration submitted successfully! Your account is currently PENDING ADMIN VERIFICATION. An administrator must verify and approve your license before you can log in.',
        isApproved: false
      });
    }

    // Demo Mode Fallback
    res.json({
      success: true,
      msg: 'Hospital registration submitted! (Demo Mode: Account pending Admin approval).',
      isApproved: false
    });
  } catch (err) {
    console.error('Hospital registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'A hospital with this license or email already exists' });
    }
    res.status(500).json({ msg: err.message || 'Hospital registration failed' });
  }
});

// @route   POST api/hospital/login
// @desc    Hospital staff login & authorization check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    if (global.isDbConnected) {
      const user = await User.findOne({ email }).populate('hospital');
      if (user) {
        if (user.role !== 'HOSPITAL_STAFF' && user.role !== 'ADMIN') {
          return res.status(403).json({ msg: 'Account is not authorized as Hospital Staff' });
        }

        // VERIFY ADMIN APPROVAL
        if (user.role === 'HOSPITAL_STAFF' && user.hospital && !user.hospital.isApproved) {
          return res.status(403).json({ 
            msg: 'ACCESS DENIED: Your hospital registration is pending verification and approval by the System Admin.' 
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
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
      }
    }

    // DEMO MODE UNAPPROVED TEST ACCOUNT
    if (email === 'pending@hospital.com') {
      return res.status(403).json({
        msg: 'ACCESS DENIED: Hospital registration is PENDING ADMIN VERIFICATION.'
      });
    }

    // DEMO MODE APPROVED HOSPITAL LOGIN FALLBACK
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

    return res.status(400).json({ msg: 'Invalid Credentials' });

  } catch (err) {
    console.error('Hospital login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

const mongoose = require('mongoose');

// @route   GET api/hospital/patient-profile/:qrId
// @desc    Full Medical Record Access for Authenticated Verified Hospital Staff
router.get('/patient-profile/:qrId', authMiddleware, checkRole(['HOSPITAL_STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { qrId } = req.params;
    const cleanQrId = qrId ? qrId.trim() : '';

    if (global.isDbConnected) {
      let profile = await Profile.findOne({ qrId: cleanQrId }).populate('user', 'name email phone');
      
      // Check User ObjectId
      if (!profile && mongoose.Types.ObjectId.isValid(cleanQrId)) {
        profile = await Profile.findOne({ user: cleanQrId }).populate('user', 'name email phone');
      }

      // Check User by ID or Email
      if (!profile) {
        let userMatch = null;
        if (mongoose.Types.ObjectId.isValid(cleanQrId)) {
          userMatch = await User.findById(cleanQrId);
        }
        if (!userMatch) {
          userMatch = await User.findOne({ email: cleanQrId.toLowerCase() });
        }
        if (userMatch) {
          profile = await Profile.findOne({ user: userMatch._id }).populate('user', 'name email phone');
        }
      }

      // If scanning demo token in database mode, find or return profile
      if (!profile && cleanQrId.toLowerCase().includes('demo')) {
        let demoUser = await User.findOne({ email: 'demo.patient@mers.com' });
        if (demoUser) {
          profile = await Profile.findOne({ user: demoUser._id }).populate('user', 'name email phone');
        }
      }

      if (profile) {
        // Audit Log Access Event
        await AccessLog.create({
          patient: profile.user?._id,
          qrId: profile.qrId || cleanQrId,
          accessType: 'VERIFIED_HOSPITAL_ACCESS',
          accessorRole: req.user?.role || 'HOSPITAL_STAFF',
          hospital: req.user?.hospitalId,
          hospitalName: req.user?.hospitalName || 'Verified Emergency Hospital',
          staffName: req.user?.name || 'Emergency Medical Officer',
          actionDetails: 'Full Medical Record & History Access'
        });

        return res.json({
          qrId: profile.qrId || cleanQrId,
          patientName: profile.user?.name || 'Patient',
          contactPhone: profile.user?.phone || 'Not provided',
          bloodGroup: profile.bloodGroup || 'Not specified',
          allergies: profile.allergies || [],
          medications: profile.medications || [],
          diseases: profile.diseases || [],
          medicalHistory: profile.medicalHistory || [],
          emergencyContacts: profile.emergencyContacts || [],
          scansCount: profile.scansCount || 1,
          verifiedAccessTime: new Date()
        });
      }
    }

    // DEMO MODE / FALLBACK
    const demoProfiles = authRouter.getDemoProfiles();
    let profile = demoProfiles.find(p => p.qrId === cleanQrId || p.user === cleanQrId);

    res.json({
      qrId: profile?.qrId || cleanQrId,
      patientName: profile?.user?.name || 'John Doe (Demo Patient)',
      contactPhone: '+91 98765 43210',
      bloodGroup: profile?.bloodGroup || 'O+',
      allergies: profile?.allergies?.length ? profile.allergies : ['Penicillin', 'Peanuts'],
      medications: profile?.medications?.length ? profile.medications : ['Aspirin 75mg daily', 'Metformin 500mg'],
      diseases: profile?.diseases?.length ? profile.diseases : ['Type 2 Diabetes', 'Hypertension'],
      medicalHistory: profile?.medicalHistory?.length ? profile.medicalHistory : ['Appendectomy 2021', 'Cardiac Stent 2023'],
      emergencyContacts: profile?.emergencyContacts?.length ? profile.emergencyContacts : [
        { name: 'Jane Doe', relation: 'Spouse', phone: '+91 98765 43210' }
      ],
      scansCount: (profile?.scansCount || 0) + 1,
      verifiedAccessTime: new Date()
    });

  } catch (err) {
    console.error('Hospital profile fetch error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
