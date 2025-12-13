const User = require('../models/User');

// find providers within maxDistance (meters) of [lng, lat]
const findProvidersNearby = async (lng, lat, maxDistance = 2000) => {
  return User.find({
    role: 'provider',
    kycStatus: 'approved',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = { findProvidersNearby };
