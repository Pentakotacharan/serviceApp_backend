module.exports = (allowApprovedOnly = true) => (req, res, next) => {
  // For providers: if kyc is not approved, block them from main features
  if (req.user.role === 'provider') {
    if (req.user.kycStatus !== 'approved') {
      return res.status(403).json({ message: 'KYC not approved', kycStatus: req.user.kycStatus });
    }
  }
  next();
};
