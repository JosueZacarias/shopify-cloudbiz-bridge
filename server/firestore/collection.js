const {  database  } = require('./_firestoreAuth');
const {
  deleteQueryBatch
} = require('../firestore/complements');
/***************************************/
/*********      CATEGORÍA      *********/
/***************************************/

const insertCollectionRelationship = async (shopifyCollectionID,cloudbizCollectionID) => {
  const res = await database.collection('collection').add({
    shopifyReference: shopifyCollectionID.toString(),
    cloudbizReference: cloudbizCollectionID.toString()
  });
  return res.id;
};

const getCollectionRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const customerRef = database.collection('collection');
  const snapshot = await customerRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs[0].data();
  return data;
};

const deleteCollectionRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const customerRef = database.collection('collection');
  const query = customerRef.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
};


module.exports = {
  insertCollectionRelationship,
  getCollectionRelationship,
  deleteCollectionRelationship,
};