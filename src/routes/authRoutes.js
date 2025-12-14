const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { loginWithFirebase } = require("../controllers/firebaseAuthController");

router.post('/register', register);
router.post('/login', login);

// Phone OTP
router.post("/login-phone-firebase", loginWithFirebase);

// Google Sign-in
router.post("/login-google-firebase", loginWithFirebase);

// Email login / signup
router.post("/login-email-firebase", loginWithFirebase);
module.exports = router;
