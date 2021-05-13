const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

var config = {
   apiKey: "AIzaSyB28KL-QJBNl6JIyeyD6PLujMh-lvm8kWs",
   authDomain: "shopify-cloudbiz-bridge.firebaseapp.com",
   databaseURL: "https://shopify-cloudbiz-bridge-default-rtdb.firebaseio.com",
   storageBucket: "shopify-cloudbiz-bridge.appspot.com",
   projectId: "shopify-cloudbiz-bridge"
 };
 firebase.initializeApp(config);
 const database = firebase.database();

 module.exports = {
   database
 }
