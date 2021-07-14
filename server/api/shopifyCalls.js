const { collectionsAll} = require('../graphQL/variables/collection');
const { customersAll } = require('../graphQL/variables/customer');
const {  
  discountAll, 
  couponDiscountAll, 
} = require ('../graphQL/variables/discount');
const { locationAll } = require('../graphQL/variables/location');
const {  productsAll } = require('../graphQL/variables/product');
const { getAllShopifyCollections } = require('../graphQL/querys/collection');
const { getAllShopifyCustomers } = require('../graphQL/querys/customer');
const { getAllShopifyDiscounts } = require('../graphQL/querys/discount');
const { getAllShopifyLocations } = require('../graphQL/querys/location');
const { getAllShopifyProducts} = require('../graphQL/querys/product');
const {
  getAllCloudbizCustomers,
  getAllCloudbizProducts,
  getCategoriesExistsCodes
} = require('./cloudbizCall');
const {
  graphQLClient,
  pad
} = require('../functions/appFunctions');
const {
  insertCollectionRelationship
} = require('../firestore/collection');
const {
  insertLastCollectionSubId,
  getLastCollectionSubId
} = require('../firestore/complements');

/* ##############################################  */
/* #############  Llamadas Shopify  #############  */
/* ##############################################  */
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
      var lastElement = shopifyClients.pop();
      cursor = lastElement.cursor;
      variable = await customersAll(cant,cursor);
      var clients = await getShopifyCustomersArray(cant,cursor,variable);
      shopifyClients.concat(lastElement,clients);
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
    var shopifyProducts = [...shopifyProductsQuery.products.edges];
    if(haveMore){
      cant += 10;
      var lastElement = shopifyProducts.pop();
      cursor = lastElement.cursor;
      variable = await productsAll(cant,cursor);
      var products = await getShopifyProductsArray(cant,cursor,variable);
      shopifyProducts.concat(lastElement,products);
    }

    return shopifyProducts;
  }catch(err){
    console.log(err);
  }
};

const getShopifyCollectionsArray = async (cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await collectionsAll(cant,cursor);
    }
    var shopifyCollectionQuery = await graphQLClient(getAllShopifyCollections,variable);
    var haveMore = shopifyCollectionQuery.collections.pageInfo.hasNextPage;
    var shopifyCollection = [...shopifyCollectionQuery.collections.edges];
    if(haveMore){
      cant += 10;
      var lastElement = shopifyCollection.pop();
      cursor = lastElement.cursor;
      variable = await collectionsAll(cant,cursor);
      var collection = await getShopifyCollectionsArray(cant,cursor,variable);
      shopifyCollection = shopifyCollection.concat(lastElement,collection);
    }
    return shopifyCollection;
  }catch(err){
    console.error(err);
  }
};

const getShopifyLocationsArray = async(cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await locationAll(cant,cursor);
    }
    var shopifyLocationQuery = await graphQLClient(getAllShopifyLocations,variable);
    var haveMore = shopifyLocationQuery.locations.pageInfo.hasNextPage;
    var shopifyLocations = [...shopifyLocationQuery.locations.edges];
    if(haveMore){
      cant += 10;
      var lastElement = shopifyLocations.pop();
      cursor = lastElement.cursor;
      variable = await locationAll(cant,cursor);
      var locations = await getShopifyLocationsArray(cant,cursor,variable);
      shopifyLocations.concat(lastElement,locations);
    }

    return shopifyLocations;
  }catch(err){
    console.error(err);
  }
}

const getShopifyDiscountsArray = async(cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await discountAll(cant,cursor);
    }
    var shopifyDiscountQuery = await graphQLClient(getAllShopifyDiscounts,variable);
    var haveMore = shopifyDiscountQuery.automaticDiscountNodes.pageInfo.hasNextPage;
    var shopifyDiscount = [...shopifyDiscountQuery.automaticDiscountNodes.edges];
    if(haveMore){
      cant += 10;
      var lastElement = shopifyDiscount.pop();
      cursor = lastElement.cursor;
      variable = await discountAll(cant,cursor);
      var discounts = await getShopifyDiscountsArray(cant,cursor,variable);
      shopifyDiscount = shopifyDiscount.concat(lastElement,discounts);
    }
    return shopifyDiscount;
  }catch(err){
    console.error(err);
  }
};

const getShopifyCouponDiscountsArray = async(cant,cursor,variable = null) => {
  try{
    if(variable == null){
      variable = await couponDiscountAll(cant,cursor);
    }
    var shopifyDiscountQuery = await graphQLClient(getAllShopifyDiscounts,variable);
    var haveMore = shopifyDiscountQuery.automaticDiscountNodes.pageInfo.hasNextPage;
    var shopifyDiscount = [...shopifyDiscountQuery.automaticDiscountNodes.edges];
    if(haveMore){
      cant += 10;
      var lastElement = shopifyDiscount.pop();
      cursor = lastElement.cursor;
      variable = await discountAll(cant,cursor);
      var discounts = await getShopifyDiscountsArray(cant,cursor,variable);
      shopifyDiscount = shopifyDiscount.concat(lastElement,discounts);
    }
    return shopifyDiscount;
  }catch(err){
    console.error(err);
  }
};


/* ##############################################  */
/* #############  Llamadas Cloudbiz  ############  */
/* ##############################################  */


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

const createCategory = async (ID,title,description,token) => {
  try{
    var createCollectionStatus = false;
    const principalCode = '4121';
    var lastIdAI = await getLastCollectionSubId();
    var actualId = '0';
    if(lastIdAI){
      actualId = lastIdAI.ai.toString();
    }else{
      var codes = await getCategoriesExistsCodes(token);
      arrayIds = codes.map((item) => {
        var num = item.split("4121").pop();
        return (!isNaN(num)?num:0);
      });
      actualId = arrayIds.sort().pop();
    }
    actualId = parseInt(actualId)+1;
    actualId = String(actualId).padStart(2, '0');
    const categoryData = {
      "code": principalCode+actualId,
      "name": title,
      "description": description,
      //"parent_id": 1401
      "parent_id": 91727
    };
    const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/category',{
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(categoryData)
    });
    const response = await resp.json();
    if(response.id != undefined){
      const saveCollectionRelationShip = await insertCollectionRelationship(ID,response.id);
      if(saveCollectionRelationShip){
        createCollectionStatus = true;
        await insertLastCollectionSubId(actualId);
      }
    }
    return createCollectionStatus;
  }catch(err){
    console.log(err);
  }
};

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

module.exports = {
  createCategory,
  getNameStructure,
  getShopifyProductsArray,
  getShopifyCustomersArray,
  getShopifyDiscountsArray,
  getShopifyLocationsArray,
  getCloudbizProductsArray,
  getCloudbizCustomersArray,
  getShopifyCollectionsArray,
  getDateIntervalForConsults,
  getShopifyCouponDiscountsArray
}