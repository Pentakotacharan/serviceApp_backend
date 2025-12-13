const Payment = require('../models/Payment');
const Task = require('../models/Task');
const User = require('../models/User');

// Release payment to provider
// This function would be triggered by a scheduled job 24 hours after task completion
const releasePayment = async (req, res) => {
  try {
    const { taskId } = req.body;
    const payment = await Payment.findOne({ taskId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Deduct platform fee / early withdrawal etc. (calc sample)
    // For demo, set full release to provider
    payment.status = 'released';
    await payment.save();

    const task = await Task.findById(taskId);
    task.paymentStatus = 'released';
    await task.save();

    // Transfer using Razorpay Payouts / external transfer integration - not implemented here
    res.json({ message: 'Payment released (DB updated). Implement payout to provider via Razorpay Payouts.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Release failed' });
  }
};

module.exports = { releasePayment };
