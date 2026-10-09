const mongoose = require('mongoose');

const EmergencyNotificationSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  contactName: String,
  contactPhone: String,
  status: {
    type: String,
    enum: ['DISPATCHED', 'DELIVERED', 'FAILED'],
    default: 'DISPATCHED'
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  responderNotes: String
}, { timestamps: true });

module.exports = mongoose.models.EmergencyNotification || mongoose.model('EmergencyNotification', EmergencyNotificationSchema);
