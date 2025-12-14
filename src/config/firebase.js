const admin = require("firebase-admin");
const path = require("path");

 const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);

    // Prevent re-initialization error if this file is imported multiple times
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

module.exports = admin;
