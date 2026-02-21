const admin = require('firebase-admin');
const logger = require('./logger');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error(`Firebase initialization error: ${error.message}`);
    throw error;
  }
};

initializeFirebase();

module.exports = admin;