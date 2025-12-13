// Requires firebase service account JSON path in env: FCM_SERVICE_ACCOUNT
const admin = require('firebase-admin');

if (process.env.FCM_SERVICE_ACCOUNT) {
  const serviceAccount = require(process.env.FCM_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

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
