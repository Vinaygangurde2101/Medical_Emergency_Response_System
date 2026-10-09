const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Global variable to track DB status
global.isDbConnected = false;

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mers_sid';

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    database: global.isDbConnected ? 'connected' : 'offline (Demo Mode Active)'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/hospital', require('./routes/hospital'));
app.use('/api/blood-banks', require('./routes/bloodBank'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/aiChat'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/schedule', require('./routes/schedule'));

// Robust DB Connection Strategy (Primary Cloud -> Local Fallback -> Demo Mode)
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    family: 4 // Force IPv4 to prevent Windows SRV DNS resolution failures
  };

  // 1. Try Primary Configured URI
  try {
    console.log('🔄 Connecting to MongoDB (Primary URI)...');
    await mongoose.connect(MONGO_URI, options);
    global.isDbConnected = true;
    console.log('✅ MongoDB Connected Successfully (Primary Database)');
    return;
  } catch (primaryErr) {
    console.warn('⚠️ Primary MongoDB Connection Warning:', primaryErr.message);
  }

  // 2. Try Local Fallback URI
  const LOCAL_URI = 'mongodb://127.0.0.1:27017/mers_sid';
  if (MONGO_URI !== LOCAL_URI) {
    try {
      console.log('🔄 Attempting Local MongoDB Fallback (127.0.0.1:27017)...');
      await mongoose.connect(LOCAL_URI, options);
      global.isDbConnected = true;
      console.log('✅ Connected to Local MongoDB Successfully');
      return;
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB Connection Warning:', localErr.message);
    }
  }

  // 3. Fallback to Demo Mode
  global.isDbConnected = false;
  console.log('--------------------------------------------------');
  console.log('⚠️ DATABASE STATUS: DEMO MODE ACTIVE (In-Memory Data Engine)');
  console.log('💡 Note: All app features (Patient, Hospital, QR, Blood Bank, AI) are 100% operational.');
  console.log('--------------------------------------------------');
};

connectDB();

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
