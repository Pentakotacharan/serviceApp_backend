const admin = require('../config/firebase'); // 🔑 uses SAME instance from fcmserver
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

module.exports = { loginWithFirebase };
