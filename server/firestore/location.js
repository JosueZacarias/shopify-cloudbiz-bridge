const {  database  } = require('./_firestoreAuth');
const {
  deleteQueryBatch
} = require('../firestore/complements');
/****************************************/
/*********      SUCURSALES      *********/
/****************************************/

const getLocationRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const customerRef = database.collection('location');
  const snapshot = await customerRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs[0].data();
  return data;
}

const insertLocationRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  const res = await database.collection('discount').add({
    shopifyReference: shopifyCollectionID.toString(),
    cloudbizReference: cloudbizCollectionID.toString()
  });
  return res.id;
}

const deleteLocationRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const Ref = database.collection('location');
  const query = Ref.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
}

module.exports = {
  getLocationRelationship,
  insertLocationRelationship,
  deleteLocationRelationship,
};