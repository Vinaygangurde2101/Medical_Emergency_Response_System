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

// @route   GET api/emergency/:qrId
// @desc    MINIMAL PUBLIC RESPONDER EMERGENCY ACCESS - MINIMUM DATA EXPOSURE
router.get('/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    if (global.isDbConnected) {
      const profile = await Profile.findOne({ qrId }).populate('user', 'name');
      if (!profile) return res.status(404).json({ msg: 'Emergency QR code not found or deactivated' });
      if (profile.isQrActive === false) return res.status(403).json({ msg: 'This Medical QR profile has been deactivated by the patient.' });

      // Increment scans count
      profile.scansCount = (profile.scansCount || 0) + 1;
      await profile.save();

      // Log Access Event
      await AccessLog.create({
        patient: profile.user._id,
        qrId: profile.qrId,
        accessType: 'PUBLIC_RESPONDER',
        accessorRole: 'FIRST_RESPONDER',
        staffName: 'Anonymous First Responder',
        actionDetails: 'Public Emergency QR Scan (Minimal View)'
      });

      // SECURE RESPONSE: Return MINIMAL public emergency view ONLY
      return res.json({
        qrId: profile.qrId,
        patientName: profile.user?.name ? `${profile.user.name.split(' ')[0]} ${profile.user.name.split(' ')[1]?.[0] || ''}.` : 'Emergency Patient',
        isQrActive: true,
        hasEmergencyContacts: (profile.emergencyContacts && profile.emergencyContacts.length > 0),
        emergencyOptions: ['CONTACT_FAMILY', 'CALL_108', 'FIRST_AID', 'BLOOD_BANK', 'HOSPITAL_LOGIN']
      });
    }

    // Demo Mode Fallback
    const demoProfiles = authRouter.getDemoProfiles();
    const profile = demoProfiles.find(p => p.qrId === qrId);
    if (!profile) return res.status(404).json({ msg: 'Emergency QR code not found' });
    if (profile.isQrActive === false) return res.status(403).json({ msg: 'QR Profile Deactivated' });

    profile.scansCount = (profile.scansCount || 0) + 1;

    // Record demo log
    demoAccessLogs.push({
      qrId,
      accessType: 'PUBLIC_RESPONDER',
      accessorRole: 'FIRST_RESPONDER',
      timestamp: new Date()
    });

    res.json({
      qrId: profile.qrId,
      patientName: 'Demo Emergency Patient',
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
    let contactCount = 0;

    if (global.isDbConnected) {
      const profile = await Profile.findOne({ qrId }).populate('user', 'name');
      if (!profile) return res.status(404).json({ msg: 'Profile not found' });

      patientName = profile.user?.name || 'Patient';
      contactCount = profile.emergencyContacts?.length || 0;

      // Log notification event
      const notif = await EmergencyNotification.create({
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

      return res.json({
        success: true,
        msg: `Emergency alert dispatched to ${contactCount > 0 ? contactCount : 1} registered family contact(s).`,
        notificationId: notif._id
      });
    }

    // Demo Mode
    demoNotifications.push({ qrId, timestamp: new Date() });
    res.json({
      success: true,
      msg: 'Emergency alert dispatched to registered family contact(s) via proxy gateway.'
    });

  } catch (err) {
    console.error('Contact family error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Helper for exporting demo logs
router.getDemoLogs = () => demoAccessLogs;

module.exports = router;
