const {  database  } = require('./_firestoreAuth');
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

module.exports = {
  deleteQueryBatch,
  getLastCollectionSubId,
  insertLastCollectionSubId,
  getDocumentDataFromFireStore,
  getCollectionDataFromFireStore
};