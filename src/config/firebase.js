const admin = require("firebase-admin");

// 1. Check if the app is already initialized to prevent "App already exists" errors
if (!admin.apps.length) {
  try {
    if (!process.env.FCM_SERVICE_ACCOUNT) {
      throw new Error("FCM_SERVICE_ACCOUNT is missing in .env file");
    }

    // 2. Parse the JSON string from .env
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);

    // 3. Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log("✅ Firebase Admin Initialized");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error.message);
  }
}

// 4. Export the initialized instance
module.exports = admin;