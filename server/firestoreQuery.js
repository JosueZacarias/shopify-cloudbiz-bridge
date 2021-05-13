const {database} = require('./firestoreAuth.js');

const insertCustomerRelationship = async (shopifyCustomerID,cloudbizCustomerID) => {
  const res = await database.collection('customer').add({
    shopifyReference: shopifyCustomerID.toString(),
    cloudbizReference: cloudbizCustomerID.toString()
  });
  return res.id;
};

const insertProductRelationship = async (shopifyProductID,shopifyVariantID,cloudbizProductID) => {
  const res = await database.collection('product').add({
    shopifyReference: shopifyProductID.toString(),
    shopifyVariantReference:shopifyVariantID.toString(),
    cloudbizReference: cloudbizProductID.toString()
  });
  return res.id;
};

const insertCustomerVIPTypeRelationship = async (shopifyCustomerVIPID,cloudbizCustomerVIPID) => {
  const res = await database.collection('customerGroup').add({
    shopifyReference: shopifyCustomerVIPID.toString(),
    cloudbizReference: cloudbizCustomerVIPID.toString()
  });
  return res.id;
};

const insertCollectionRelationship = async (shopifyCollectionID,cloudbizCollectionID) => {
  const res = await database.collection('collection').add({
    shopifyReference: shopifyCollectionID.toString(),
    cloudbizReference: cloudbizCollectionID.toString()
  });
  return res.id;
};

const getCustomerVIPTypeRelationship = async (shopifyCustomerVIPID,cloudbizCustomerVIPID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCustomerVIP == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCustomerVIPID.toString();
  }else{
    searchID = cloudbizCustomerVIPID.toString();
  }
  const customerRef = database.collection('customerGroup');
  const snapshot = await customerRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs[0].data();
  return data;
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

const getCustomerRelationship = async (shopifyCustomerID,cloudbizProductID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCustomerID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizProductID.toString();
  }else{
    searchID = shopifyCustomerID.toString();
  }
  const customerRef = database.collection('customer');
  const snapshot = await customerRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs[0].data();
  return data;
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

const deleteCustomerRelationship = async (shopifyCustomerID,cloudbizCustomerID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCustomerID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizProductID.toString();
  }else{
    searchID = shopifyCustomerID.toString();
  }
  const customerRef = database.collection('customer');
  const query = customerRef.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
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

const deleteCustomerVIPTypeRelationship = async (shopifyCustomerVIPID,cloudbizCustomerVIPID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCustomerVIPID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCustomerVIPID.toString();
  }else{
    searchID = shopifyCustomerVIPID.toString();
  }
  const customerRef = database.collection('customerGroup');
  const query = customerRef.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
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

const deleteQueryBatch = async (database,query,resolve) => {
  snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }
  const batch = database.batch();
  batch.delete(snapshot.docs[0].ref);
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(database, query, resolve);
  });
};

module.exports = {
  insertCustomerRelationship,
  insertProductRelationship,
  insertCustomerVIPTypeRelationship,
  insertCollectionRelationship,

  getCustomerVIPTypeRelationship,
  getCollectionRelationship,
  getCustomerRelationship,
  getProductRelationship,
  
  deleteCustomerRelationship,
  deleteProductRelationship,
  deleteCustomerVIPTypeRelationship,
  deleteCollectionRelationship
};
