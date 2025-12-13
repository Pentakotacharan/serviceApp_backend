const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('./db');

// Razorpay instance
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Firebase Admin Initialization
const admin = require('firebase-admin');
let firebaseEnabled = false;

try {
  if (process.env.FCM_SERVICE_ACCOUNT) {
    const serviceAccount = require(path.resolve(process.env.FCM_SERVICE_ACCOUNT));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseEnabled = true;
  }
} catch (err) {
  console.error("⚠ Firebase Initialization Failed:", err.message);
}

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// App configuration
const appConfig = {
  port: process.env.PORT || 4000,
  baseUrl: process.env.APP_BASE_URL || 'http://localhost:4000',
};

module.exports = {
  connectDB,
  razorpay,
  admin,
  firebaseEnabled,
  jwtConfig,
  appConfig,
};
