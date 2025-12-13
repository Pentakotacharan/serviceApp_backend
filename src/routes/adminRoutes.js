const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { listPendingKyc, reviewKyc } = require('../controllers/adminController');

router.get('/kyc/pending', auth, role('admin'), listPendingKyc);
router.post('/kyc/:userId/review', auth, role('admin'), reviewKyc);

module.exports = router;
