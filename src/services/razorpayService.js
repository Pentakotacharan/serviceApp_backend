const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order (client creates order for amount in paise)
const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  const options = {
    amount, // in paise
    currency,
    receipt,
    payment_capture: 1
  };
  return instance.orders.create(options);
};

module.exports = { createOrder, instance };
