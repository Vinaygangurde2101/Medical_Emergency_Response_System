const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const AccessLog = require('../models/AccessLog');
const EmergencyNotification = require('../models/EmergencyNotification');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const emergencyRouter = require('./emergency');
const authRouter = require('./auth');

// In-Memory Demo Data Store for Admin Management when DB is offline
let demoHospitals = [
  {
    _id: 'hosp_1',
    name: 'City General Emergency Hospital',
    licenseNumber: 'HOSP-MUM-9920',
    city: 'Mumbai',
    address: '12 Central Care Blvd',
    contactPhone: '+91 22 2400 1100',
    email: 'hospital@mers.com',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 30)
  },
  {
    _id: 'hosp_2',
    name: 'Apex Trauma & Critical Care Center',
    licenseNumber: 'HOSP-MUM-8841',
    city: 'Mumbai',
    address: '88 Highway Expressway',
    contactPhone: '+91 22 2800 3344',
    email: 'apex@hospital.org',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 15)
  },
  {
    _id: 'hosp_3',
    name: 'Suburban Community Hospital',
    licenseNumber: 'HOSP-MUM-4412',
    city: 'Mumbai',
    address: '404 Metro Station Road',
    contactPhone: '+91 22 2999 5511',
    email: 'suburban@health.in',
    isApproved: false,
    createdAt: new Date(Date.now() - 86400000 * 2)
  }
];

let demoBloodBanks = [
  {
    _id: 'bb_1',
    name: 'City Red Cross Blood Bank',
    address: '12 Medical College Road, Central District',
    city: 'Mumbai',
    phone: '+91 22 2555 0199',
    inventory: [
      { bloodGroup: 'O+', units: 14, status: 'AVAILABLE' },
      { bloodGroup: 'A+', units: 8, status: 'AVAILABLE' },
      { bloodGroup: 'B+', units: 12, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 3, status: 'CRITICAL' },
      { bloodGroup: 'O-', units: 2, status: 'CRITICAL' },
      { bloodGroup: 'A-', units: 0, status: 'OUT_OF_STOCK' },
      { bloodGroup: 'B-', units: 4, status: 'AVAILABLE' },
      { bloodGroup: 'AB-', units: 1, status: 'CRITICAL' }
    ]
  },
  {
    _id: 'bb_2',
    name: 'Apex Lifeline Emergency Blood Center',
    address: '45 Emergency Care Blvd, Sector 4',
    city: 'Mumbai',
    phone: '+91 22 2888 4400',
    inventory: [
      { bloodGroup: 'O+', units: 22, status: 'AVAILABLE' },
      { bloodGroup: 'A+', units: 15, status: 'AVAILABLE' },
      { bloodGroup: 'B+', units: 19, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 7, status: 'AVAILABLE' },
      { bloodGroup: 'O-', units: 5, status: 'AVAILABLE' },
      { bloodGroup: 'A-', units: 2, status: 'CRITICAL' },
      { bloodGroup: 'B-', units: 11, status: 'AVAILABLE' },
      { bloodGroup: 'AB-', units: 3, status: 'CRITICAL' }
    ]
  }
];

let demoEmergencyNotifs = [
  {
    _id: 'notif_1',
    qrId: 'demo_qr_01',
    patientName: 'John Doe (Demo Patient)',
    contactName: 'Jane Doe (Spouse)',
    contactPhone: '+91 98765 *****',
    status: 'DELIVERED',
    location: { address: 'Vikhroli Expressway, Mumbai' },
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    _id: 'notif_2',
    qrId: 'demo_qr_02',
    patientName: 'Rahul Sharma',
    contactName: 'Ramesh Sharma (Father)',
    contactPhone: '+91 91234 *****',
    status: 'DELIVERED',
    location: { address: 'Andheri West Metro Station, Mumbai' },
    createdAt: new Date(Date.now() - 7200000)
  }
];

// @route   GET api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const totalUsers = await User.countDocuments({ role: 'PATIENT' });
      const totalHospitals = await Hospital.countDocuments();
      const approvedHospitals = await Hospital.countDocuments({ isApproved: true });
      const totalLogs = await AccessLog.countDocuments();
      const totalNotifs = await EmergencyNotification.countDocuments();
      const totalBloodBanks = await BloodBank.countDocuments();

      return res.json({
        totalPatients: totalUsers,
        totalHospitals,
        approvedHospitals,
        totalAccessLogs: totalLogs,
        totalEmergencyNotifs: totalNotifs,
        totalBloodBanks,
        systemStatus: 'OPERATIONAL'
      });
    }

    res.json({
      totalPatients: 42,
      totalHospitals: demoHospitals.length,
      approvedHospitals: demoHospitals.filter(h => h.isApproved).length,
      totalAccessLogs: emergencyRouter.getDemoLogs().length + 18,
      totalEmergencyNotifs: demoEmergencyNotifs.length + 5,
      totalBloodBanks: demoBloodBanks.length,
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
        ipAddress: '192.168.1.45',
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
        ipAddress: '49.37.12.89',
        actionDetails: 'Emergency Contact Gateway Activated',
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        _id: 'log_3',
        qrId: 'demo_qr_02',
        accessType: 'VERIFIED_HOSPITAL_ACCESS',
        accessorRole: 'HOSPITAL_STAFF',
        hospitalName: 'Apex Trauma & Critical Care Center',
        staffName: 'Dr. Rajesh Kumar',
        ipAddress: '10.0.0.12',
        actionDetails: 'Emergency Blood Group Verification',
        createdAt: new Date(Date.now() - 14400000)
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
      const hospitals = await Hospital.find().sort({ createdAt: -1 });
      return res.json(hospitals);
    }
    res.json(demoHospitals);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/hospitals
router.post('/hospitals', async (req, res) => {
  try {
    const { name, licenseNumber, city, address, contactPhone, email } = req.body;
    if (!name || !licenseNumber || !city || !address || !contactPhone || !email) {
      return res.status(400).json({ msg: 'All hospital fields are required' });
    }

    if (global.isDbConnected) {
      const existing = await Hospital.findOne({ $or: [{ email }, { licenseNumber }] });
      if (existing) return res.status(400).json({ msg: 'Hospital with this email or license already exists' });

      const newHosp = new Hospital({
        name,
        licenseNumber,
        city,
        address,
        contactPhone,
        email,
        isApproved: true
      });
      await newHosp.save();
      return res.json({ success: true, data: newHosp });
    }

    const newDemoHosp = {
      _id: 'hosp_' + Date.now(),
      name,
      licenseNumber,
      city,
      address,
      contactPhone,
      email,
      isApproved: true,
      createdAt: new Date()
    };
    demoHospitals.unshift(newDemoHosp);
    res.json({ success: true, data: newDemoHosp });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/admin/hospitals/:id/toggle-approval
router.put('/hospitals/:id/toggle-approval', async (req, res) => {
  try {
    const { id } = req.params;

    if (global.isDbConnected) {
      const hospital = await Hospital.findById(id);
      if (!hospital) return res.status(404).json({ msg: 'Hospital not found' });

      hospital.isApproved = !hospital.isApproved;
      await hospital.save();
      return res.json({ success: true, data: hospital });
    }

    const hosp = demoHospitals.find(h => h._id === id);
    if (!hosp) return res.status(404).json({ msg: 'Hospital not found' });
    hosp.isApproved = !hosp.isApproved;
    res.json({ success: true, data: hosp });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/admin/users
router.get('/users', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const users = await User.find({ role: 'PATIENT' }).select('-password').sort({ createdAt: -1 }).lean();
      const userIds = users.map(u => u._id);
      const profiles = await Profile.find({ user: { $in: userIds } }).lean();

      const combined = users.map(u => {
        const prof = profiles.find(p => p.user.toString() === u._id.toString());
        return {
          ...u,
          qrId: prof?.qrId || 'N/A',
          bloodGroup: prof?.bloodGroup || 'Unspecified',
          isQrActive: prof?.isQrActive ?? true,
          scansCount: prof?.scansCount || 0,
          allergiesCount: prof?.allergies?.length || 0,
          contactsCount: prof?.emergencyContacts?.length || 0
        };
      });
      return res.json(combined);
    }

    // Demo Mode Users
    const demoProfiles = authRouter.getDemoProfiles();
    const demoList = [
      {
        _id: 'user_demo_1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        role: 'PATIENT',
        qrId: 'demo_qr_01',
        bloodGroup: 'O+',
        isQrActive: true,
        scansCount: 5,
        allergiesCount: 2,
        contactsCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 10)
      },
      {
        _id: 'user_demo_2',
        name: 'Anita Roy',
        email: 'anita.roy@example.com',
        phone: '+91 99887 76655',
        role: 'PATIENT',
        qrId: 'demo_qr_02',
        bloodGroup: 'B+',
        isQrActive: true,
        scansCount: 2,
        allergiesCount: 1,
        contactsCount: 2,
        createdAt: new Date(Date.now() - 86400000 * 5)
      }
    ];

    res.json(demoList);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/admin/users/:userId/toggle-qr
router.put('/users/:userId/toggle-qr', async (req, res) => {
  try {
    const { userId } = req.params;

    if (global.isDbConnected) {
      const profile = await Profile.findOne({ user: userId });
      if (!profile) return res.status(404).json({ msg: 'Patient profile not found' });

      profile.isQrActive = !profile.isQrActive;
      await profile.save();
      return res.json({ success: true, isQrActive: profile.isQrActive });
    }

    res.json({ success: true, isQrActive: false });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/admin/blood-banks
router.get('/blood-banks', async (req, res) => {
  try {
    if (global.isDbConnected) {
      let banks = await BloodBank.find();
      if (!banks || banks.length === 0) banks = demoBloodBanks;
      return res.json(banks);
    }
    res.json(demoBloodBanks);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/blood-banks
router.post('/blood-banks', async (req, res) => {
  try {
    const { name, address, city, phone, inventory } = req.body;
    if (!name || !address || !city || !phone) {
      return res.status(400).json({ msg: 'Name, address, city and phone are required' });
    }

    const defaultInventory = inventory || [
      { bloodGroup: 'O+', units: 10, status: 'AVAILABLE' },
      { bloodGroup: 'A+', units: 5, status: 'AVAILABLE' },
      { bloodGroup: 'B+', units: 8, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 2, status: 'CRITICAL' },
      { bloodGroup: 'O-', units: 0, status: 'OUT_OF_STOCK' }
    ];

    if (global.isDbConnected) {
      const newBank = new BloodBank({
        name,
        address,
        city,
        phone,
        coordinates: { lat: 19.076, lng: 72.8777 },
        inventory: defaultInventory
      });
      await newBank.save();
      return res.json({ success: true, data: newBank });
    }

    const newDemoBank = {
      _id: 'bb_' + Date.now(),
      name,
      address,
      city,
      phone,
      inventory: defaultInventory
    };
    demoBloodBanks.unshift(newDemoBank);
    res.json({ success: true, data: newDemoBank });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/admin/blood-banks/:id/inventory
router.put('/blood-banks/:id/inventory', async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodGroup, units, status } = req.body;

    if (global.isDbConnected) {
      const bank = await BloodBank.findById(id);
      if (!bank) return res.status(404).json({ msg: 'Blood bank not found' });

      let item = bank.inventory.find(i => i.bloodGroup === bloodGroup);
      if (item) {
        item.units = Number(units);
        item.status = status;
      } else {
        bank.inventory.push({ bloodGroup, units: Number(units), status });
      }
      await bank.save();
      return res.json({ success: true, data: bank });
    }

    const bank = demoBloodBanks.find(b => b._id === id);
    if (bank) {
      let item = bank.inventory.find(i => i.bloodGroup === bloodGroup);
      if (item) {
        item.units = Number(units);
        item.status = status;
      } else {
        bank.inventory.push({ bloodGroup, units: Number(units), status });
      }
    }
    res.json({ success: true, data: bank });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/admin/emergency-notifs
router.get('/emergency-notifs', async (req, res) => {
  try {
    if (global.isDbConnected) {
      const notifs = await EmergencyNotification.find().sort({ createdAt: -1 });
      return res.json(notifs);
    }
    res.json(demoEmergencyNotifs);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;

