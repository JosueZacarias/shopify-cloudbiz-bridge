const {  database  } = require('./_firestoreAuth');
const {
  deleteQueryBatch
} = require('../firestore/complements');
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

module.exports = {
  getCustomerRelationship,
  getAllFirestoreCustomers,
  deleteCustomerRelationship,
  insertCustomerRelationship,
  getCustomerVIPTypeRelationship,
  insertCustomerVIPTypeRelationship,
  deleteCustomerVIPTypeRelationship,
};