const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require("firebase-admin"); // 🔑 uses SAME instance from fcmserver


const loginWithFirebase = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Firebase token required" });
    }

    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    // Create user if first time
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email || null,
        phone: decoded.phone_number || null,
        role: null, // role selected later
      });
    }

    // Issue backend JWT
    const backendToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: backendToken,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, location } = req.body;
    const hashed = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({ name, email, phone, password: hashed, role, location });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.password) return res.status(400).json({ message: 'No password set for this user' });
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

module.exports = { register, login,loginWithFirebase };
