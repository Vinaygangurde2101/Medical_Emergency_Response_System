const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qrId: {
    type: String,
    required: true
  },
  accessType: {
    type: String,
    enum: ['PUBLIC_RESPONDER', 'VERIFIED_HOSPITAL_ACCESS'],
    required: true
  },
  accessorRole: {
    type: String,
    default: 'FIRST_RESPONDER'
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  hospitalName: {
    type: String,
    default: 'N/A'
  },
  staffName: {
    type: String,
    default: 'Anonymous First Responder'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  location: {
    type: String,
    default: 'Unknown Location'
  },
  actionDetails: {
    type: String,
    default: 'QR Scan Event'
  }
}, { timestamps: true });

module.exports = mongoose.models.AccessLog || mongoose.model('AccessLog', AccessLogSchema);
