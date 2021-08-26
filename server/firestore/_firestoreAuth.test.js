const admin = require('firebase-admin');

const serviceAccount = require('../../auth/shopify-cloudbiz-bridge-f05fe08034a2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const database = admin.firestore();


 module.exports = {
   database
 }
