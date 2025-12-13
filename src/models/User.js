const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, enum: ['client','provider','admin'], default: 'client' },

  // KYC
  kycStatus: { type: String, enum: ['not_submitted','pending','approved','rejected'], default: 'not_submitted' },
  aadhaarNumber: { type: String },
  panNumber: { type: String },
  dob: { type: Date },
  gender: { type: String },
  skill: { type: String },

  aadhaarFrontUrl: { type: String },
  aadhaarBackUrl: { type: String },
  panFrontUrl: { type: String },
  panBackUrl: { type: String },
  adminRemarks: { type: String },

  // Location for geo queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] } // [lng, lat]
  },

  // Performance metrics
  totalTasksPending: { type: Number, default: 0 },
  totalTasksAccepted: { type: Number, default: 0 },
  totalTasksCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  // Notification token (FCM)
  fcmToken: { type: String },

  createdAt: { type: Date, default: Date.now }
});

// Create geo index
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('User', UserSchema);
