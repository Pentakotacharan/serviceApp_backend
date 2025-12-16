// ✅ CONNECTED HERE: Import the already-initialized admin
const admin = require('../config/firebase'); 

const sendToToken = async (token, payload) => {
  if (!token) return;
  try {
    await admin.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    });
  } catch (err) {
    console.error('FCM send error', err);
  }
};

module.exports = { sendToToken };