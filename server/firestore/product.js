const {  database  } = require('./_firestoreAuth');
const {
  deleteQueryBatch
} = require('../firestore/complements');
/***************************************/
/*********      PRODUCTOS      *********/
/***************************************/

const insertProductRelationship = async (shopifyProductID,shopifyVariantID,cloudbizProductID) => {
  const res = await database.collection('product').add({
    shopifyReference: shopifyProductID.toString(),
    shopifyVariantReference:shopifyVariantID.toString(),
    cloudbizReference: cloudbizProductID.toString()
  });
  return res.id;
};

const getProductRelationship = async (shopifyProductID,shopifyVariantID,cloudbizProductID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyProductID == null && shopifyVariantID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizProductID.toString();
  }else if(shopifyProductID == null && cloudbizProductID == null){
    whereID = 'shopifyVariantReference';
    searchID = shopifyVariantID.toString();
  }else{
    searchID = shopifyProductID.toString();
  }
  const productRef = database.collection('product');
  const snapshot = await productRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs;
  return data;
};

const deleteProductRelationship = async (shopifyProductID,shopifyVariantID,cloudbizProductID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCustomerID == null && shopifyVariantID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizProductID.toString();
  }else if(shopifyCustomerID == null && cloudbizProductID == null){
    whereID = 'shopifyVariantReference';
    searchID = shopifyVariantID.toString();
  }else{
    searchID = shopifyProductID.toString();
  }
  const productRef = database.collection('product');
  const query = productRef.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
};

module.exports = {
  getProductRelationship,
  insertProductRelationship,
  deleteProductRelationship
};