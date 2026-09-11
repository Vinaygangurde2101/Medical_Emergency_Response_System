const mongoose = require('mongoose');

const BloodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  inventory: [{
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'CRITICAL', 'OUT_OF_STOCK'],
      default: 'AVAILABLE'
    }
  }],
  isDemoData: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodBank', BloodBankSchema);
