const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Hospital = require('../models/Hospital');
const AccessLog = require('../models/AccessLog');
const EmergencyNotification = require('../models/EmergencyNotification');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const emergencyRouter = require('./emergency');

// @route   GET api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const totalUsers = await User.countDocuments({ role: 'PATIENT' });
      const totalHospitals = await Hospital.countDocuments();
      const totalLogs = await AccessLog.countDocuments();
      const totalNotifs = await EmergencyNotification.countDocuments();

      return res.json({
        totalPatients: totalUsers,
        totalHospitals,
        totalAccessLogs: totalLogs,
        totalEmergencyNotifs: totalNotifs,
        systemStatus: 'OPERATIONAL'
      });
    }

    res.json({
      totalPatients: 42,
      totalHospitals: 5,
      totalAccessLogs: emergencyRouter.getDemoLogs().length + 18,
      totalEmergencyNotifs: 7,
      systemStatus: 'OPERATIONAL (DEMO MODE)'
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/admin/access-logs
router.get('/access-logs', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const logs = await AccessLog.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('patient', 'name email');
      return res.json(logs);
    }

    // Demo Mode logs
    const demoLogs = emergencyRouter.getDemoLogs();
    const defaultLogs = [
      {
        _id: 'log_1',
        qrId: 'demo_qr_01',
        accessType: 'VERIFIED_HOSPITAL_ACCESS',
        accessorRole: 'HOSPITAL_STAFF',
        hospitalName: 'City General Emergency Hospital',
        staffName: 'Dr. Sarah Connor',
        actionDetails: 'Full Medical Record Lookup',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        _id: 'log_2',
        qrId: 'demo_qr_01',
        accessType: 'PUBLIC_RESPONDER',
        accessorRole: 'FIRST_RESPONDER',
        hospitalName: 'N/A',
        staffName: 'First Responder #108',
        actionDetails: 'Emergency Contact Gateway Activated',
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    res.json([...demoLogs, ...defaultLogs]);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/admin/hospitals
router.get('/hospitals', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const hospitals = await Hospital.find();
      return res.json(hospitals);
    }

    res.json([
      {
        _id: 'hosp_1',
        name: 'City General Emergency Hospital',
        licenseNumber: 'HOSP-MUM-9920',
        city: 'Mumbai',
        address: '12 Central Care Blvd',
        contactPhone: '+91 22 2400 1100',
        email: 'hospital@mers.com',
        isApproved: true
      },
      {
        _id: 'hosp_2',
        name: 'Apex Trauma & Critical Care Center',
        licenseNumber: 'HOSP-MUM-8841',
        city: 'Mumbai',
        address: '88 Highway Expressway',
        contactPhone: '+91 22 2800 3344',
        email: 'apex@hospital.org',
        isApproved: true
      }
    ]);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
