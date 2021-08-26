const {database} = require('./firestoreAuth.js');
/*******************************************************/
/*********      FUNCIONES COMPLEMENTARIAS      *********/
/*******************************************************/
const insertLastCollectionSubId = async (subId) => {
  const res = await database.collection('collection').doc('lastAI').set({
    ai: subId.toString()
  });
  return res.id;
};

const getLastCollectionSubId = async () => {
  const lastIdRef = database.collection('collection').doc('lastAI');
  const id = await lastIdRef.get();
  if(!id.exists){
    console.log('Documento no encontrado');
    return false;
  }
  data = id.data();
  return data;
};

const getCollectionDataFromFireStore = async (collection) => {
  const response = await database.collection(collection).get();
  var collectionList = []
  response.forEach(collectionData => {
    collectionList.push({"document_id":collectionData.id, "data":collectionData.data()});
  });
  
  return collectionList;
};

const getDocumentDataFromFireStore = async (collection,doc) => {
  const response = await database.collection(collection).doc(doc).get();
  if(!response.exists){
    console.log(`Dato no encontrado para la colección: ${collection} y para el documento: ${doc}`);
    return false;
  }
  responseData = response.data();
  return responseData;
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


/**************************************/
/*********      CLIENTES      *********/
/**************************************/

const insertCustomerRelationship = async (shopifyCustomerID,cloudbizCustomerID) => {
  const res = await database.collection('customer').add({
    shopifyReference: shopifyCustomerID.toString(),
    cloudbizReference: cloudbizCustomerID.toString()
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

const getAllFirestoreCustomers = async () => {
  try{
    var customerList = [];
    const customers = await database.collection('customer').get();
    
    customers.forEach(customer => {
      customerList.push({"document_id":customer.id, "data":customer.data()});
    });

    return customerList;
  }catch(err){
    console.log(err);
  }
};

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


/****************************************/
/*********      DESCUENTOS      *********/
/****************************************/

const getDiscountRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const customerRef = database.collection('discount');
  const snapshot = await customerRef.where(whereID, '==', searchID).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return undefined;
  }
  data = snapshot.docs[0].data();
  return data;
}

const insertDiscountRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  const res = await database.collection('discount').add({
    shopifyReference: shopifyCollectionID.toString(),
    cloudbizReference: cloudbizCollectionID.toString()
  });
  return res.id;
}

const deleteDiscountRelationship = async(shopifyCollectionID,cloudbizCollectionID) => {
  var whereID = 'shopifyReference';
  var searchID = '';
  if(shopifyCollectionID == null){
    whereID = 'cloudbizReference';
    searchID = cloudbizCollectionID.toString();
  }else{
    searchID = shopifyCollectionID.toString();
  }
  const Ref = database.collection('discount');
  const query = Ref.where(whereID, '==', searchID);
  return new Promise((resolve,reject) => {
    deleteQueryBatch(database,query,resolve).catch(reject);
  });
}

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
  insertCustomerRelationship,
  insertProductRelationship,
  insertCustomerVIPTypeRelationship,
  insertCollectionRelationship,
  insertLastCollectionSubId,

  getCustomerVIPTypeRelationship,
  getCollectionRelationship,
  getCustomerRelationship,
  getProductRelationship,
  getLastCollectionSubId,
  
  deleteCustomerRelationship,
  deleteProductRelationship,
  deleteCustomerVIPTypeRelationship,
  deleteCollectionRelationship,

  getAllFirestoreCustomers,
  getDocumentDataFromFireStore,
  getCollectionDataFromFireStore,

  getLocationRelationship,
  insertLocationRelationship,
  deleteLocationRelationship,

  getDiscountRelationship,
  insertDiscountRelationship,
  deleteDiscountRelationship,
};
