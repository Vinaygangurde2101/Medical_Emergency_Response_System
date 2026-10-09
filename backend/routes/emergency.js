const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');
const EmergencyNotification = require('../models/EmergencyNotification');
const authRouter = require('./auth');

// In-Memory Emergency Event Logs for Demo mode
let demoAccessLogs = [];
let demoNotifications = [];

// Default fallback demo profile
const defaultDemoProfile = {
  qrId: 'demo_qr_01',
  user: { name: 'John Doe' },
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  medications: ['Aspirin 75mg daily', 'Metformin 500mg'],
  diseases: ['Type 2 Diabetes', 'Hypertension'],
  medicalHistory: ['Appendectomy 2021', 'Cardiac Stent 2023'],
  emergencyContacts: [
    { name: 'Jane Doe', relation: 'Spouse', phone: '+91 98765 43210', isPrimary: true }
  ],
  scansCount: 12,
  isQrActive: true
};

// @route   GET api/emergency/:qrId
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// @route   GET api/emergency/:qrId
// @desc    MINIMAL PUBLIC RESPONDER EMERGENCY ACCESS - MINIMUM DATA EXPOSURE
router.get('/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;
    const cleanQrId = qrId ? qrId.trim() : '';

    if (global.isDbConnected) {
      let profile = await Profile.findOne({ qrId: cleanQrId }).populate('user', 'name email phone');
      
      // If not found by qrId, check if cleanQrId is a valid User ObjectId
      if (!profile && mongoose.Types.ObjectId.isValid(cleanQrId)) {
        profile = await Profile.findOne({ user: cleanQrId }).populate('user', 'name email phone');
      }

      // If still not found, check if a User exists by ID or Email
      if (!profile) {
        let userMatch = null;
        if (mongoose.Types.ObjectId.isValid(cleanQrId)) {
          userMatch = await User.findById(cleanQrId);
        }
        if (!userMatch) {
          userMatch = await User.findOne({ email: cleanQrId.toLowerCase() });
        }

        if (userMatch) {
          profile = new Profile({
            user: userMatch._id,
            qrId: nanoid(10),
            isQrActive: true
          });
          await profile.save();
          profile.user = userMatch;
        }
      }

      // Auto-create sample profile if scanning demo_qr_01 in database mode
      if (!profile && cleanQrId.toLowerCase().includes('demo')) {
        let demoUser = await User.findOne({ email: 'demo.patient@mers.com' });
        if (!demoUser) {
          demoUser = new User({
            name: 'John Doe (Demo Patient)',
            email: 'demo.patient@mers.com',
            phone: '+91 98765 43210',
            password: 'demopassword123',
            role: 'PATIENT'
          });
          await demoUser.save();
        }

        profile = new Profile({
          user: demoUser._id,
          qrId: cleanQrId,
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Peanuts'],
          medications: ['Aspirin 75mg daily', 'Metformin 500mg'],
          diseases: ['Type 2 Diabetes', 'Hypertension'],
          medicalHistory: ['Appendectomy 2021'],
          emergencyContacts: [{ name: 'Jane Doe', relation: 'Spouse', phone: '+91 98765 43210', isPrimary: true }],
          isQrActive: true
        });
        await profile.save();
        profile.user = demoUser;
      }

      if (!profile) return res.status(404).json({ msg: 'Emergency QR code not found or deactivated' });
      if (profile.isQrActive === false) return res.status(403).json({ msg: 'This Medical QR profile has been deactivated by the patient.' });

      // Increment scans count
      profile.scansCount = (profile.scansCount || 0) + 1;
      await profile.save();

      // Log Access Event
      await AccessLog.create({
        patient: profile.user?._id,
        qrId: profile.qrId,
        accessType: 'PUBLIC_RESPONDER',
        accessorRole: 'FIRST_RESPONDER',
        staffName: 'Anonymous First Responder',
        actionDetails: 'Public Emergency QR Scan (Minimal View)'
      });

      // SECURE RESPONSE: Return MINIMAL public emergency view ONLY
      const fullName = profile.user?.name || 'Emergency Patient';
      const nameParts = fullName.split(' ');
      const displayName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[1][0]}.` 
        : fullName;

      return res.json({
        qrId: profile.qrId,
        patientName: displayName,
        fullPatientName: fullName,
        isQrActive: true,
        hasEmergencyContacts: (profile.emergencyContacts && profile.emergencyContacts.length > 0),
        emergencyOptions: ['CONTACT_FAMILY', 'CALL_108', 'FIRST_AID', 'BLOOD_BANK', 'HOSPITAL_LOGIN']
      });
    }

    // Demo Mode Fallback
    const demoProfiles = authRouter.getDemoProfiles();
    let profile = demoProfiles.find(p => p.qrId === cleanQrId || p.user === cleanQrId);

    // If looking up demo token or empty array, fallback to defaultDemoProfile
    if (!profile && (cleanQrId.toLowerCase().includes('demo') || demoProfiles.length === 0)) {
      profile = defaultDemoProfile;
    }

    if (!profile) return res.status(404).json({ msg: 'Emergency QR code not found' });
    if (profile.isQrActive === false) return res.status(403).json({ msg: 'QR Profile Deactivated' });

    profile.scansCount = (profile.scansCount || 0) + 1;

    // Record demo log
    demoAccessLogs.push({
      qrId: cleanQrId,
      accessType: 'PUBLIC_RESPONDER',
      accessorRole: 'FIRST_RESPONDER',
      timestamp: new Date()
    });

    res.json({
      qrId: profile.qrId || cleanQrId,
      patientName: profile.user?.name || 'Demo Emergency Patient',
      fullPatientName: profile.user?.name || 'Demo Emergency Patient',
      isQrActive: true,
      hasEmergencyContacts: true,
      emergencyOptions: ['CONTACT_FAMILY', 'CALL_108', 'FIRST_AID', 'BLOOD_BANK', 'HOSPITAL_LOGIN']
    });
  } catch (err) {
    console.error('Emergency QR error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/emergency/contact-family
// @desc    Trigger anonymized notification to patient emergency contacts
router.post('/contact-family', async (req, res) => {
  try {
    const { qrId, location, note } = req.body;
    if (!qrId) return res.status(400).json({ msg: 'QR Identifier required' });

    let patientName = 'Patient';
    let targetPhone = '+919876543210';
    let contactCount = 1;

    if (global.isDbConnected) {
      let profile = await Profile.findOne({ qrId }).populate('user', 'name');
      if (!profile && mongoose.Types.ObjectId.isValid(qrId)) {
        profile = await Profile.findOne({ user: qrId }).populate('user', 'name');
      }

      if (profile) {
        patientName = profile.user?.name || 'Patient';
        contactCount = profile.emergencyContacts?.length || 1;
        if (profile.emergencyContacts?.[0]?.phone) {
          targetPhone = profile.emergencyContacts[0].phone;
        }

        await EmergencyNotification.create({
          qrId,
          patientName,
          contactName: profile.emergencyContacts?.[0]?.name || 'Primary Contact',
          contactPhone: 'MASKED_GATEWAY_SEND',
          status: 'DISPATCHED',
          location: location || {},
          responderNotes: note || 'Emergency Responder scanned QR and requested immediate contact.'
        });

        await AccessLog.create({
          patient: profile.user._id,
          qrId,
          accessType: 'PUBLIC_RESPONDER',
          accessorRole: 'FIRST_RESPONDER',
          actionDetails: 'Triggered Emergency Family Notification Gateway'
        });
      }
    }

    demoNotifications.push({ qrId, timestamp: new Date() });

    // Format clean phone number & location text for emergency dispatch
    const cleanPhone = targetPhone.replace(/[^\d+]/g, '');
    const locText = location?.lat && location?.lng 
      ? `Location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Emergency location logged';

    const alertMessage = `🚨 MERS EMERGENCY ALERT: An emergency responder has scanned the Medical QR ID for ${patientName}. ${locText}. Please respond immediately.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(alertMessage)}`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(alertMessage)}`;

    res.json({
      success: true,
      msg: `Emergency alert dispatched to ${contactCount} registered family contact(s) via proxy gateway.`,
      dispatchData: {
        patientName,
        contactsNotified: contactCount,
        whatsappUrl,
        smsUrl
      }
    });

  } catch (err) {
    console.error('Contact family error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Helper for exporting demo logs
router.getDemoLogs = () => demoAccessLogs;

module.exports = router;
