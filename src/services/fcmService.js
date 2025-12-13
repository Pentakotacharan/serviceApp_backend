// Requires firebase service account JSON path in env: FCM_SERVICE_ACCOUNT
const admin = require('firebase-admin');

if (process.env.FCM_SERVICE_ACCOUNT) {
  try {
    // FIX: Use JSON.parse() because the variable contains the actual JSON data, not a file path
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);

    // Prevent re-initialization error if this file is imported multiple times
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error("Error parsing FCM_SERVICE_ACCOUNT:", error);
  }
} else {
  console.error("FCM_SERVICE_ACCOUNT environment variable is missing.");
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
