const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String },
  description: { type: String },
  images: [String],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending','requested','assigned','in_progress','completed','cancelled'], default: 'pending' },
  requests: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' }
    }
  ],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  paymentStatus: { type: String, enum: ['held','released','refunded'], default: 'held' },
  razorpayOrderId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

TaskSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Task', TaskSchema);
