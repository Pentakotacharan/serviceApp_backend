const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { releasePayment } = require('../controllers/paymentController');

// release payment (protected - ideally called by cron/admin)
router.post('/release', auth, role(['admin']), releasePayment);

module.exports = router;
