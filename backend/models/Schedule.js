const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    required: true
  },
  appointmentId: {
    type: String,
    default: function() {
      return 'APT-' + (1000 + (this.srNo || Math.floor(Math.random() * 9000)));
    }
  },
  patientName: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    default: '+91 ***** *****'
  },
  doctor: {
    type: String,
    default: 'General OPD Specialist'
  },
  room: {
    type: String,
    default: 'OPD Cabin 101'
  },
  time: {
    type: String,
    default: '10:30 AM'
  },
  triage: {
    type: String,
    enum: ['EMERGENCY', 'URGENT', 'ROUTINE'],
    default: 'ROUTINE'
  },
  status: {
    type: String,
    enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'WAITING'
  },
  notes: {
    type: String,
    default: 'Appointment Record'
  }
}, { timestamps: true });

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
