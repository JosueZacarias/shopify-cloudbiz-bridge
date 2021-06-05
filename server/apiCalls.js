const {
  customerVariableMutationCreate,
  customerVariableMutationDelete,
  productVariableMutationCreateUpdate,
  productImageVariableMutationCreate,
  productVariableMutationDelete,
  productVariantVariableMutationCreateUpdate,
  productVariantVariableMutationDelete,
  collectionVariableMutationCreate,
  collectionVariableMutationDelete,
  customersAll,
  productsAll
} = require('./variables.js');
const {
  getAllCloudbizCustomers,
  getAllCloudbizProducts
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
  getAllFirestoreCustomers,
  getCollectionDataFromFireStore,
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
  getAllShopifyCustomers,
  getAllShopifyProducts
} = require('./query.js');

const verifyCustomersChangesOnCloudbiz = async () => {
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

const verifyProductsChangesOnShopify = async() => {
  try{
    const token = await getToken();
    var cant = 10;
    var cursor = null;
    var dates = getDateIntervalForConsults();
    //Datos de productos en Firestore
    var firestoreProductsCreated = await getCollectionDataFromFireStore('product');
    var firestoreProductsCount = firestoreProductsCreated.length;

    //Datos de productos en Cloudbiz
    var cloudbizProducts = await getCloudbizProductsArray(token);
    var cloudbizProductsCount = cloudbizProducts.length;

    var shopifyProducts = await getShopifyProductsArray(cant,cursor);
    var shopifyProductsCount = shopifyProducts.length;

    var variables = undefined;

    cloudbizProducts.forEach(item => {
      var categoryRelation = await getCollectionRelationship(null,item.category.id);
      var images = await productImageVariableMutationCreate(item.name,item.image);
      var price = item.filter(price => {
        if(price.price_list.is_default == 1){
          return price;
        }
      });
      var taxable = item.taxes.length>0?true:false;
      var taxaIncluded = (price.with_tax==1?true:false);
      
      if(taxaIncluded){
        
      }
      var productVariant = await productVariantVariableMutationCreateUpdate(item,item.code,null,taxable,item.title,price);
      if(cloudbizProductsCount > 0 && cloudbizProductsCount > firestoreProductsCount && cloudbizProductsCount > shopifyProductsCount){
        variables = await productVariableMutationCreateUpdate(
          item.description,
          item.is_inventory==1?true:false,
          "ACTIVE",
          [],
          item.name,
          [],
          "",
          item.type,
          [
            images
          ],
          [categoryRelation.shopifyReference],
          []
        );
      }else if(cloudbizProductsCount > 0  && cloudbizProductsCount == firestoreProductsCount && cloudbizProductsCount == shopifyProductsCount){

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

const getShopifyProductsArray = async (cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await productsAll(cant,cursor);
    }
    var shopifyProductsQuery = await graphQLClient(getAllShopifyProducts,variable);
    var haveMore = shopifyProductsQuery.products.pageInfo.hasNextPage;
    var shopifyProducts = [...shopifyProductsQuery.customers.edges];
    if(haveMore){
      cant += 10;
      cursor = shopifyProducts.pop().cursor;
      variable = await productsAll(cant,cursor);
      var products = await getShopifyProductsArray(cant,cursor,variable);
      shopifyProducts.push(products);
    }

    return shopifyProducts;
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

const getCloudbizProductsArray = async(token,cant = 1) => {
  try{
    var products = [];
    const noNeedFields = [
      'deliver_pack',
      'only_pack',
      'conversion_rate',
      'deleted_at'
    ];
    var getProducts = await getAllCloudbizProducts(token,cant);
    var productsCount = getProducts.pop().rows;
    if(productsCount > cant){
      getProducts = await getAllCloudbizProducts(token,4);
      getProducts.pop();
      getProducts = [...getProducts];
      products = getProducts.map((item) => {
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
    return products;
  }catch(err){
    console.log(err);
  }
}

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
  return await verifyCustomersChangesOnCloudbiz();
};

module.exports = {
  verifyCustomersChangesOnCloudbiz,
  verifyProductsChangesOnShopify,
};
