const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const kycCheck = require('../middlewares/kycCheck');
const taskController = require('../controllers/taskController');

// Client creates razorpay order + task
router.post('/create-order', auth, role('client'), taskController.createTaskOrder);

// Payment success webhook (public endpoint)
router.post('/payment-webhook', taskController.handlePaymentSuccess);

// Provider requests a task
router.post('/:taskId/request', auth, role('provider'), taskController.requestTask);

// Client accepts provider (body: taskId, providerId)
router.post('/accept', auth, role('client'), taskController.acceptRequest);

// Provider marks complete
router.post('/:taskId/complete', auth, role('provider'), kycCheck(), taskController.completeTask);

module.exports = router;
