const admin = require('firebase-admin');

const serviceAccount = require('../auth/app-bridge-pos-f907fedda091.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const database = admin.firestore();


 module.exports = {
   database
 }
