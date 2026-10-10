const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Serverless DB Connection Middleware
let dbPromise = null;
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    global.isDbConnected = true;
    return next();
  }
  
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  
  try {
    await dbPromise;
  } catch (e) {
    dbPromise = null;
  }
  next();
});

// Root route for health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    database: global.isDbConnected ? 'connected' : 'offline (Demo Mode Active)',
    readyState: mongoose.connection.readyState
  });
});
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    database: global.isDbConnected ? 'connected' : 'offline (Demo Mode Active)'
  });
});

// Dual-Mounted Routes for Vercel Serverless & Standard Hosting
const mountRoute = (path, router) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
};

mountRoute('/auth', require('./routes/auth'));
mountRoute('/patient', require('./routes/patient'));
mountRoute('/emergency', require('./routes/emergency'));
mountRoute('/hospital', require('./routes/hospital'));
mountRoute('/blood-banks', require('./routes/bloodBank'));
mountRoute('/admin', require('./routes/admin'));
mountRoute('/ai', require('./routes/aiChat'));
mountRoute('/analyze', require('./routes/analyze'));
mountRoute('/schedule', require('./routes/schedule'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Robust DB Connection Strategy (Primary Cloud -> Local Fallback -> Demo Mode)
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 5000,
    family: 4
  };

  if (MONGO_URI && MONGO_URI.trim() !== '') {
    try {
      console.log('🔄 Connecting to MongoDB Cloud...');
      await mongoose.connect(MONGO_URI, options);
      global.isDbConnected = true;
      console.log('✅ MongoDB Connected Successfully');
      return;
    } catch (primaryErr) {
      console.warn('⚠️ MongoDB Cloud Connection Warning:', primaryErr.message);
    }
  }

  // Try Local Fallback URI only when running locally (not on Vercel serverless)
  if (!process.env.VERCEL && !process.env.LAMBDA_TASK_ROOT) {
    const LOCAL_URI = 'mongodb://127.0.0.1:27017/mers_sid';
    if (MONGO_URI !== LOCAL_URI) {
      try {
        await mongoose.connect(LOCAL_URI, options);
        global.isDbConnected = true;
        console.log('✅ Connected to Local MongoDB');
        return;
      } catch (localErr) {}
    }
  }

  global.isDbConnected = false;
  console.log('⚠️ DATABASE STATUS: DEMO MODE ACTIVE (In-Memory Engine)');
};

connectDB();

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
