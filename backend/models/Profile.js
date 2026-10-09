const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrId: {
    type: String,
    unique: true,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: ''
  },
  allergies: [String],
  medications: [String],
  diseases: [String],
  medicalHistory: [String],
  isQrActive: {
    type: Boolean,
    default: true
  },
  emergencyContacts: [{
    name: String,
    relation: String,
    phone: String,
    isPrimary: { type: Boolean, default: false }
  }],
  scansCount: {
    type: Number,
    default: 0
  },
  privacySettings: {
    allowEmergencyContactGateway: { type: Boolean, default: true },
    maskPatientNamePublic: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
