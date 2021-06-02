const {
  customerVariableMutationCreate,
  customerVariableMutationDelete,
  productVariableMutationCreateUpdate,
  productVariableMutationDelete,
  productVariantVariableMutationCreateUpdate,
  productVariantVariableMutationDelete,
  collectionVariableMutationCreate,
  collectionVariableMutationDelete,
  customersAll
} = require('./variables.js');
const {
  getAllCloudbizCustomers,
} = require('./apiClient.js');
const {
  getToken,
  graphQLClient,
  pad
} = require('./appFunctions.js');
const {
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
  deleteCollectionRelationship,
  getAllFirestoreCustomers
} = require('./firestoreQuery.js');

const {
  customerCreate,
  customerUpdate,
  customerDelete,
  productCreateUpdate,
  productDelete,
  productVariantCreateUpdate,
  productVariantDelete,
  collectionCreateUpdate,
  collectionDelete
} = require('./mutations.js');

const {
  getProductVariantByIDQuery,
  getAllShopifyCustomers
} = require('./query.js');

const verifyChangesOnCloudbiz = async () => {
  try{
    const token = await getToken();
    var cant = 10;
    var cursor = null;
    var dates = getDateIntervalForConsults();
    //Datos ya almacenados en firestore
    var firestoreCustomersCreated = await getAllFirestoreCustomers();
    var firestoreCountClients = firestoreCustomersCreated.length;
    //Datos de cloudbiz
    var cloudbizClients = await getCloudbizCustomersArray(token);
    var cloudbizCountClients = cloudbizClients.length;
    //Datos de shopify
    var shopifyClients = await getShopifyCustomersArray(cant,cursor);
    var shopifyCountClients = shopifyClients.length;
    var variables = undefined;
    var names = {};
    cloudbizClients.forEach(async item => {
      names = getNameStructure(item.full_name);
      if(cloudbizCountClients > 0 && (cloudbizCountClients > firestoreCountClients && cloudbizCountClients > shopifyCountClients)){
        if(Date.parse(item.created_at) >= Date.parse(dates.idate) && Date.parse(item.created_at) <= Date.parse(dates.fdate) && item.email != null){
          variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city);
          var queryResult = await graphQLClient(customerCreate,variables);
          await insertCustomerRelationship(queryResult.customerCreate.customer.id,item.id);
        }
      }else if(cloudbizCountClients > 0 && (cloudbizCountClients == firestoreCountClients && cloudbizCountClients == shopifyCountClients)){
        if(Date.parse(item.updated_at) >= Date.parse(dates.idate) && Date.parse(item.updated_at) <= Date.parse(dates.fdate) && item.email != null){
          var clientCreated = await getCustomerRelationship(null,item.id);
          variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city,clientCreated.shopifyReference);
          var queryResult = await graphQLClient(customerUpdate,variables);
        }
      }
      
    });
    return true;
  }catch(err){
    console.log(err);
  }
};

const getShopifyCustomersArray = async (cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await customersAll(cant,cursor);
    }
    var shopifyClientsQuery = await graphQLClient(getAllShopifyCustomers,variable);
    var haveMore = shopifyClientsQuery.customers.pageInfo.hasNextPage;
    var shopifyClients = [...shopifyClientsQuery.customers.edges];
    if(haveMore){
      cant += 10;
      cursor = shopifyClients.pop().cursor;
      variable = await customersAll(cant,cursor);
      var clients = await getShopifyCustomersArray(cant,cursor,variable);
      shopifyClients.push(clients);
    }

    return shopifyClients;
  }catch(err){
    console.log(err);
  }
};

const getCloudbizCustomersArray = async (token,cant = 1) => {
  try{
    var cloudbizCustomers = [];
    const noNeedFields = [
      'seller_id',
      'discount',
      'is_vendor',
      'balance_in_favor',
      'seller',
      'persons',
      'points',
      'delete_at'
    ];
    var getCustomers = await getAllCloudbizCustomers(token,cant);
    var customerCount = getCustomers.pop().rows;
    if(customerCount > cant){
      getCustomers = await getAllCloudbizCustomers(token,4);
      getCustomers.pop();
      cloudbizCustomers = [...getCustomers];
      cloudbizCustomers = cloudbizCustomers.map((item) => {
        noNeedFields.forEach((key) => {
          delete item[key];
        });
        var keys = Object.keys(item);
        keys.forEach(key => {
          if(item[key] == null){
            item[key] = "";
          }
        });
        return item;
      });
    }
    return cloudbizCustomers;
  }catch(err){
    console.log(err);
  }
};

const updateCustomerOnShopify = async () => {
  try{
    const token = await getToken();
    const dates = getDateIntervalForConsults();
    const clients = await callGetClients(token,dates.idate,dates.fdate);
    clients.forEach(async(item, i) => {
      var clientCreated = await getCustomerRelationship(null,item.id);
      var names = getNameStructure(item.full_name);
      var variables = {};
      if(clientCreated == undefined){
        variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city);
      }else{
        variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city,clientCreated.shopifyReference);
      }

      const query = JSON.stringify({query:customerCreateUpdate,variables:variables});
      var queryResult = await graphQLClient(query);
      var firestoreSaved = await insertCustomerRelationship(queryResult.data.customerCreate.customer.id,item.id);
      console.log(firestoreSaved);
    });
    return clients;
  }catch(err){
    console.log(err);
  }
};

const updateProductOnShopify = async() => {
  try{
    const token = await getToken();
    const dates = getDateIntervalForConsults();
  }catch(err){
    console.log(err);
  }
};

const updateCategoryOnShopify = async() => {};

const updateCustomerGroupOnShopify = async() => {};

//Retorna nombre seccionado en nombres y apellidos a partir de un nombre completo
const getNameStructure = (names) => {
  var fullName = names.trim().split(" ");

  var namesArray = fullName.map((name) => {
    return name.trim();
  });
  var names = {};
  switch (namesArray.length) {
    case 1:
      names = {firstName: namesArray[0], lastName:""};
      break;
    case 2:
    names = {firstName: namesArray[0],lastName:namesArray[1]};
      break;
    case 3:
      names = {firstName: namesArray[0],lastName:namesArray[1] + " "+ namesArray[2]};
      break;
    case 4:
      names = {firstName: namesArray[0] + " "+ namesArray[1],lastName:namesArray[2] + " "+ namesArray[3]};
      break;
  }

  return names;
};

const getDateIntervalForConsults = () => {
  const today = new Date();
  const yesterday = new Date(today);
  //Definir el tiempo para consultar a CloudBiz
  yesterday.setDate(yesterday.getDate() - 1);
  var finalDate = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate())+' '+pad(today.getHours())+':'+pad(today.getMinutes())+':'+pad(today.getSeconds());
  var initialDate = yesterday.getFullYear()+'-'+pad((yesterday.getMonth()+1))+'-'+pad(yesterday.getDate())+' '+pad(yesterday.getHours())+':'+pad(yesterday.getMinutes())+':'+pad(yesterday.getSeconds());
  return {
    "idate": initialDate,
    "fdate": finalDate
  };
};

/*******************************************************/
/*********      UPDATE DATA FROM CLOUDBIZ      *********/
/*******************************************************/

const updateDataFromCloudbizToShopify = async () => {
  //await updateCustomerOnShopify();
};

module.exports = {
  verifyChangesOnCloudbiz
};
