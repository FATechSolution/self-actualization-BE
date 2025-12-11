import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK Configuration
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FCM_PROJECT_ID,
  private_key_id: process.env.FCM_PRIVATE_KEY_ID,
  private_key: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FCM_CLIENT_EMAIL,
  client_id: process.env.FCM_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FCM_CLIENT_X509_CERT_URL,
};

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    // Don't throw error, allow app to continue (notifications will fail gracefully)
  }
}

export default admin;

