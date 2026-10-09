const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approved for prototype demo
  }
}, { timestamps: true });

module.exports = mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);
