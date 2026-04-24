import * as admin from 'firebase-admin';
import * as path from 'path';

// Load service account from JSON file (avoids .env newline escaping issues)
const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    throw error;
  }
}

export default admin;