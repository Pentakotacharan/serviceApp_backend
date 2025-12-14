const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

// Submit KYC (Aadhaar + PAN images and details)
const submitKyc = async (req, res) => {
  try {
    const user = req.user;

    const { name, aadhaarNumber, panNumber, dob, gender, skill, lat, lng } = req.body;
    // files via multer
    const aadhaarFront = req.files?.aadhaarFront?.[0]?.path;
    const aadhaarBack = req.files?.aadhaarBack?.[0]?.path;
    const panFront = req.files?.panFront?.[0]?.path;
    const panBack = req.files?.panBack?.[0]?.path;

    user.name = name || user.name;
    user.aadhaarNumber = aadhaarNumber;
    user.panNumber = panNumber;
    user.dob = dob;
    user.gender = gender;
    user.skill = skill;
    user.aadhaarFrontUrl = aadhaarFront;
    user.aadhaarBackUrl = aadhaarBack;
    user.panFrontUrl = panFront;
    user.panBackUrl = panBack;
    user.kycStatus = 'pending';

    if (lat && lng) {
      user.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    }

    await user.save();
    res.json({ message: 'KYC submitted and waiting for approval', kycStatus: user.kycStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'KYC submission failed' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// update fcm token
const updateFcm = async (req, res) => {
  const { token } = req.body;
  req.user.fcmToken = token;
  await req.user.save();
  res.json({ message: 'FCM token updated' });
};

const setRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["client", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    req.user.role = role;
    await req.user.save();

    res.json({ success: true, role });
  } catch (err) {
    res.status(500).json({ message: "Failed to set role" });
  }
};


module.exports = { submitKyc, getProfile, updateFcm,setRole };
