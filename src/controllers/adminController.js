const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

// List pending KYCs
const listPendingKyc = async (req, res) => {
  const users = await User.find({ role: 'provider', kycStatus: 'pending' }).select('-password');
  res.json(users);
};

// Approve or reject KYC
const reviewKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, remarks } = req.body; // action: approve | reject
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!['approve','reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    user.kycStatus = action === 'approve' ? 'approved' : 'rejected';
    user.adminRemarks = remarks || '';
    await user.save();

    await AdminLog.create({
      adminId: req.user._id,
      action: `${action}_kyc`,
      targetUserId: user._id,
      remarks
    });

    res.json({ message: `User KYC ${user.kycStatus}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Review failed' });
  }
};

module.exports = { listPendingKyc, reviewKyc };
