const {
  customerVariableMutationCreate,
  customerVariableMutationDelete,
  productVariableMutationCreateUpdate,
  productVariableMutationDelete,
  productVariantVariableMutationCreateUpdate,
  productVariantVariableMutationDelete,
  collectionVariableMutationCreate,
  collectionVariableMutationDelete
} = require('./variables.js');
const {
  getToken,
  callGetClients,
  graphQLClient
} = require('./apiClient.js');

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
  deleteCollectionRelationship
} = require('./firestoreQuery.js');

const {
  customerCreateUpdate,
  customerDelete,
  productCreateUpdate,
  productDelete,
  productVariantCreateUpdate,
  productVariantDelete,
  collectionCreateUpdate,
  collectionDelete
} = require('./mutations.js');

const {
  getProductVariantByIDQuery
} = require('./query.js');

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
  yesterday.setMinutes(yesterday.getMinutes() - 15);
  var finalDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
  var initialDate = yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate()+' '+yesterday.getHours()+':'+yesterday.getMinutes()+':'+yesterday.getSeconds();
  return {
    "idate": initialDate,
    "fdate": finalDate
  };
};


module.exports = {
  updateCustomerOnShopify
};
