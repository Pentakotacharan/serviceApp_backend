const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { submitKyc, getProfile, updateFcm,updateProfile } = require('../controllers/userController');
const { setRole } = require("../controllers/userController");

// Submit KYC - multipart form-data with files: aadhaarFront, aadhaarBack, panFront, panBack
router.post('/kyc', auth, upload.fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'panFront', maxCount: 1 },
  { name: 'panBack', maxCount: 1 }
]), submitKyc);

router.get('/me', auth, getProfile);
router.post('/fcm', auth, updateFcm);
router.put("/profile", auth, updateProfile);
router.post("/set-role", auth, setRole);
module.exports = router;
