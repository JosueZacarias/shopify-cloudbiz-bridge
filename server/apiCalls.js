const {
  customerVariableMutationCreate,
  customerVariableMutationDelete,
  productVariableMutationCreate,
  productVariableMutationUpdate,
  productImageVariableMutationCreate,
  productVariableMutationDelete,
  productVariantVariableMutationCreate,
  productVariantVariableMutationUpdate,
  productVariantVariableMutationDelete,
  collectionVariableMutationCreate,
  collectionVariableMutationDelete,
  productInventoryItemInput,
  productInventoryQuantitiesInput,
  createAutomaticBasicDiscount,
  customersAll,
  productsAll,
  collectionsAll,
  discountAll,
  couponDiscountAll,
  locationAll,
  productInventory,
  inventoryAdjustQuantity
} = require('./variables.js');
const {
  getAllCloudbizCustomers,
  getAllCloudbizProducts,
  getAllCloudbizDiscounts,
  getAllCategoryInfoFromCloudbiz,
  getAllCloudbizLocations,
  getCategoriesExistsCodes,
  createDiscount,
  updateDiscount,
  deleteDiscount
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
  insertLastCollectionSubId,
  getLastCollectionSubId,
  getDiscountRelationship,
  insertDiscountRelationship,
  deleteDiscountRelationship,
  getLocationRelationship,
} = require('./firestoreQuery.js');

const {
  customerCreate,
  customerUpdate,
  customerDelete,
  productCreateMutation,
  productUpdateMutation,
  productDeleteMutation,
  productMediaCreate,
  productVariantCreate,
  productVariantUpdate,
  productVariantDelete,
  collectionCreate,
  collectionUpdate,
  collectionDelete,
  discountCreate,
  discountUpdate,
  discountDelete,
  productVariantInventoryUpdate
} = require('./mutations.js');

const {
  getProductVariantByIDQuery,
  getAllShopifyCustomers,
  getAllShopifyProducts,
  getAllShopifyCollections,
  getAllShopifyDiscounts,
  getAllShopifyLocations,
  getProductInventoryId
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
    if(cloudbizCountClients > 0 && (cloudbizCountClients > firestoreCountClients && cloudbizCountClients > shopifyCountClients)){
      cloudbizClients.forEach(async item => {
        names = getNameStructure(item.full_name);
        if(Date.parse(item.created_at) >= Date.parse(dates.idate) && Date.parse(item.created_at) <= Date.parse(dates.fdate) && item.email != null){
          variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city);
          var queryResult = await graphQLClient(customerCreate,variables);
          await insertCustomerRelationship(queryResult.customerCreate.customer.id,item.id);
        }
      });
    }else if(cloudbizCountClients > 0 && (cloudbizCountClients == firestoreCountClients && cloudbizCountClients == shopifyCountClients)){
      cloudbizClients.forEach(async item => {
        names = getNameStructure(item.full_name);
        if(Date.parse(item.updated_at) >= Date.parse(dates.idate) && Date.parse(item.updated_at) <= Date.parse(dates.fdate) && item.email != null){
          var clientCreated = await getCustomerRelationship(null,item.id);
          variables = await customerVariableMutationCreate(item.email,names.firstName,names.lastName,item.mobile_phone,item.phone1,item.address,item.city,clientCreated.shopifyReference);
          await graphQLClient(customerUpdate,variables);
        }
      });
    }else if(cloudbizCountClients < shopifyCountClients && cloudbizCountClients < firestoreCountClients){
      var deleteCustomer = [];
      firestoreCustomersCreated.forEach(customer => {
        var find = cloudbizClients.find(cli => {
          return cli.id == customer.data.cloudbizReference;
        });
        if(find === undefined){
          deleteCustomer.push(customer);
        }
      });
      if(deleteCustomer.length > 0){
        deleteCustomer.forEach(async deleted => {
          var variables = await customerVariableMutationDelete(deleted.data.shopifyReference);
          var query = await graphQLClient(customerDelete,variables);
          if(query.customerDelete.deletedCustomerId != undefined){
            await deleteCollectionRelationship(deleted.data.shopifyReference,null);
            status = true;
          }          
        });
      }
    }
    return true;
  }catch(err){
    console.log(err);
  }
};

const verifyCollectionsChangesOnCloudbiz = async () => {
  try{
    var cant = 10;
    var cursor = null;
    var status = false;
    //Categorías en Firestore
    const firestoreCollections = await getCollectionDataFromFireStore('collection');
    var collections = firestoreCollections.filter(item => {
      if(item.document_id != "lastAI") return item;
    });
    const firestoreCollectionsCount = collections.length;
    //Categorías en cloudbiz
    const token = await getToken();
    const cloudbizCollections = await getAllCategoryInfoFromCloudbiz(token);
    const cloudbizCollectionsCount = cloudbizCollections.subcategories.length;
    //Categorías en Shopify
    const shopifyCollections = await getShopifyCollectionsArray(cant,cursor);
    const shopifyCollectionsCount = shopifyCollections.length;

    if(cloudbizCollectionsCount > 0 && cloudbizCollectionsCount > shopifyCollectionsCount && cloudbizCollectionsCount > firestoreCollectionsCount){
      cloudbizCollections.subcategories.forEach(async collection => {
        var collectionExits = await getCollectionRelationship(null,collection.id);
        if(collectionExits === undefined){
          var variables = await collectionVariableMutationCreate(collection.description,collection.name);
          var queryResult = await graphQLClient(collectionCreate,variables);
          await insertCollectionRelationship(queryResult.collectionCreate.collection.id,collection.id);
          status = true;
        }
      });
    }else if(cloudbizCollectionsCount > 0 && cloudbizCollectionsCount === shopifyCollectionsCount && cloudbizCollectionsCount === firestoreCollectionsCount){
      cloudbizCollections.subcategories.forEach(async collection => {
        var collectionExits = await getCollectionRelationship(null,collection.id);
        if(collectionExits !== undefined){
          var variables = await collectionVariableMutationCreate(collection.description,collection.name,collectionExits.shopifyReference);
          await graphQLClient(collectionUpdate,variables);
          status = true;
        }
      });
    }else if(cloudbizCollectionsCount < shopifyCollectionsCount && cloudbizCollectionsCount < firestoreCollectionsCount){
      var deleteCollections = [];
      collections.forEach(collection => {
        var find = cloudbizCollections.subcategories.find(col => {
          return col.id == collection.data.cloudbizReference;
        });
        if(find === undefined){
          deleteCollections.push(collection);
        }
      });
      if(deleteCollections.length > 0){
        deleteCollections.forEach(async deleted => {
          var variables = await collectionVariableMutationDelete(deleted.data.shopifyReference);
          var query = await graphQLClient(collectionDelete,variables);
          if(query.collectionDelete.deletedCollectionId != undefined){
            await deleteCollectionRelationship(deleted.data.shopifyReference,null);
            status = true;
          }          
        });
      }
    }else if((shopifyCollectionsCount > cloudbizCollectionsCount && shopifyCollectionsCount > firestoreCollectionsCount) && (cloudbizCollectionsCount === firestoreCollectionsCount)){
      shopifyCollections.forEach(async collection => {
        var exists = await getCollectionRelationship(collection.node.id,null);
        if(exists === undefined){
          status = await createCategory(collection.node.id,collection.node.title,collection.node.descriptionHtml,token);
        }
      });
    }
    return status;
  }catch(err){
    console.error(err);
  }
}

const verifyProductsChangesOnCloudbiz = async() => {
  try{
    const RegexVariants = new RegExp(/([\w ]+) - ([\w\s]+)/g);
    var productCreationStatus = false;
    const token = await getToken();
    var cant = 10;
    var cursor = null;
    //Datos de productos en Firestore
    var firestoreProductsCreated = await getCollectionDataFromFireStore('product');
    var firestoreProductsCount = firestoreProductsCreated.length;

    //Datos de productos en Cloudbiz
    var cloudbizProducts = await getCloudbizProductsArray(token);
    var cloudbizProductsCount = cloudbizProducts.length;

    var shopifyProducts = await getShopifyProductsArray(cant,cursor);
    var shopifyProductsCount = shopifyProducts.length;

    //Clasificar productos unicos o productos con variantes
    let arrayProductUnique = [];
    let arrayProductVariant = [];
    let arrayProductVarianGroup = [];
    cloudbizProducts.forEach(product => {
      if(product.type === "product"){
        if(RegexVariants.test(product.name)){
          arrayProductVariant.push(product);
        }else{
          arrayProductUnique.push(product.id);
        }
      }
    });

    if(cloudbizProductsCount > firestoreProductsCount && cloudbizProductsCount > shopifyProductsCount){
      await Promise.all(cloudbizProducts.map(async item => {
        if(item.type === "product"){
          //Verificar la categoría o colección del producto
          var categoryRelation = await getCollectionRelationship(null,item.category.id);
          var collections = [];
          if(categoryRelation != undefined){
            collections.push(categoryRelation.shopifyReference);
          }
          //Crear variable de creación de imagén del producto
          var images = null;
          if(item.image != "" || item.image != undefined || item.image != null){
            images = await productImageVariableMutationCreate(item.name,item.image);
          }
          var totalPrice = 0.0;
          //Obtener el precio por defecto del producto en cloudbiz
          var price = item.prices.filter(price => {
            if(price.price_list.is_default == 1){
              return price;
            }
          });
          //verificar si el producto tiene impuestos aplicados
          var taxable = (item.taxes.length > 0) ? true : false;
          //Verificar si el precio del producto tiene incluido el impuesto en su total
          var taxaIncluded = (price.with_tax == 1) ? true : false;
    
          //Incluir o no el impuesto en el precio del producto
          if(taxaIncluded){
            totalPrice = price.price*1.15;
          }else{
            totalPrice = price.price;
          }
          //para establecer el precio de costo del producto
          var inventory = await productInventoryItemInput(item.inventory.cost_price,true);
          //para establecer la cantidad de inventario del producto
          var bodega = [];
          item.inventory.warehouses.forEach(async warehouse => {
            var location = await getLocationRelationship(null,warehouse.warehouse_id);
            var inventoryLevelInput = await productInventoryQuantitiesInput(warehouse.available_stock,location.shopifyReference);
            bodega.push(inventoryLevelInput);
          });
          /**/
          /*########################################################################*/
          /*                      MANEJO DE VARIANTES DE PRODUCTO                   */
          /*########################################################################*/
          /**/
          var ifUniqueProductName = item.name.split(" - ");
          arrayProductVariant.forEach(variant => {
            var variantProductName = variant.split(" - ");
            if(ifUniqueProductName == variantProductName){
              
            }
          });

          var ImageUploadedId = [];
          if(createProduct.productCreate.product.images.edges.length > 0){
            createProduct.productCreate.product.images.edges.forEach(image => {
              ImageUploadedId.push(image.node.id);
            });
            ImageUploadedId = createProduct.productCreate.product.images.edges[0].node.id;
          }
          
          var productVariant = await productVariantVariableMutationCreate(
            createProduct.productCreate.product.id,
            item.code,
            null,
            taxable,
            item.title,
            totalPrice,
            null,
            inventory,
            bodega,
            ImageUploadedId
          );
          var createVariantProduct = await graphQLClient(productVariantCreate,productVariant);
          if(createVariantProduct.productVariantCreate.productVariant.id != undefined){
            var locationID = createVariantProduct.productVariantCreate.productVariant.inventoryItem.inventoryLevels.edges[0].node.id;
            var variableInventory = await productInventory(createVariantProduct.productVariantCreate.productVariant.id,locationID);
            var inventoryData = await graphQLClient(getProductInventoryId,variableInventory);
            var insertFirebase = await insertProductRelationship(
              createProduct.productCreate.id,
              createVariantProduct.productVariantCreate.productVariant.id,
              item.id,
              inventoryData.productVariant.inventoryItem.inventoryLevel.id
              );
            if(insertFirebase){
              productCreationStatus = true;
            }
          }
          
          
          /**/
          /*#######################################################################*/
          /*#######################################################################*/
          /**/


  
          variables = await productVariableMutationCreate(
            item.description,
            (item.is_inventory == 1) ? true : false,//Publicar si tienen inventario
            "ACTIVE", //Estado
            [], //etiquetas
            item.name, //titulo
            [],//variantes
            "",//Proveedor
            item.type,//tipo de producto
            [images],//coleccion de imagenes
            collections,//colecciones a las que puede pertenener
            []//Colecciones de las que se tiene que quitar
          );
          var createProduct = await graphQLClient(productCreateMutation,variables);
  
          if(productUnique.length > 0 && productUnique.indexOf(item.id) !== -1){
            
            if(createProduct.productCreate.product.id != undefined){
              
            }
          }
        }
      }));
    }else if(cloudbizProductsCount == firestoreProductsCount && cloudbizProductsCount == shopifyProductsCount){
      //Identificar productos provenientes de cloudbiz con variantes
      await Promise.all(cloudbizProducts.map(async item => {
        if(item.type === "product"){
          //Verificar la categoría o colección del producto
          var categoryRelation = await getCollectionRelationship(null,item.category.id);
          //Verificar la existencia en firebase
          var relationship = await getProductRelationship(null,null,item.id);
          //Crear variable de creación de imagén del producto
          var images = null;
          if(item.image != "" || item.image != undefined || item.image != null){
            images = await productImageVariableMutationCreate(item.name,item.image);
          }
          
          var totalPrice = 0.0;
          //Obtener el precio por defecto del producto en cloudbiz
          var price = item.prices.filter(price => {
            if(price.price_list.is_default == 1){
              return price;
            }
          });
          //verificar si el producto tiene impuestos aplicados
          var taxable = (item.taxes.length > 0) ? true : false;
          //Verificar si el precio del producto tiene incluido el impuesto en su total
          var taxaIncluded = (price.with_tax == 1) ? true : false;
    
          //Incluir o no el impuesto en el precio del producto
          if(taxaIncluded){
            totalPrice = price.price*1.15;
          }else{
            totalPrice = price.price;
          }
          //para establecer el precio de costo del producto
          var inventory = await productInventoryItemInput(item.inventory.cost_price,true);
          var inventoryLevelId = "";
          
          if(RegexVariants.test(item.name)){
            var variable = await productVariantVariableMutationUpdate(
              relationship.shopifyVariantReference,
              item.code,
              null,
              taxable,
              item.title,
              totalPrice,
              null,
              item.image,
              inventory
            );
            var createVariantProduct = await graphQLClient(productVariantUpdate,variable);
            if(createVariantProduct !== undefined){
              if(createVariantProduct.productVariantUpdate.productVariant.id !== undefined){
                productCreationStatus = true;
              }
            }
          }else{
            var variable = await productVariableMutationUpdate(
              relationship.shopifyReference,
              item.description,
              (item.is_inventory == 1) ? true : false,
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
  
            var updateProduct = await graphQLClient(productUpdateMutation,variable);
            if(updateProduct.productUpdate.product.id != undefined){
              var createVariantProduct = await graphQLClient(productVariantCreate,productVariant);
              if(createVariantProduct !== undefined){
                if(createVariantProduct.productVariantCreate.productVariant.id !== undefined){
                  productCreationStatus = true;
                }
              }
            }
          }
          //para establecer la cantidad de inventario del producto
          await Promise.all(item.inventory.warehouses.map(async warehouse => {
            var location = await getLocationRelationship(null,warehouse.warehouse_id);
            var variableInventoryLevelId = await productInventory(relationship.shopifyVariantReference,location.shopifyReference);
            var resultInventoryLevelId = await graphQLClient(getProductInventoryId,variableInventoryLevelId);
            if(resultInventoryLevelId){
              inventoryLevelId = resultInventoryLevelId.productVariant.inventoryItem.inventoryLevel.id;
              if(inventoryLevelId !== undefined){
                var variableUpdate = await inventoryAdjustQuantity(inventoryLevelId,warehouse.available_stock);
                var resultInventoryUpdate = await graphQLClient(productVariantInventoryUpdate,variableUpdate);
                if(resultInventoryUpdate && productCreationStatus){
                  productCreationStatus = true;
                }
              }
            }
          }));
        }
      }));
    }else if(cloudbizProductsCount < firestoreProductsCount && cloudbizProductsCount < shopifyProductsCount){

    }
    return productCreationStatus;
  }catch(err){
    console.log(err);
  }
};

const verifyDiscountsChangesOnCloudbiz = async() => {
  try{
    const token = await getToken();
    var cant = 10;
    var cursor = null;
    var status = false;
    //Descuentos en Firebase
    var firebaseDiscounts = await getCollectionDataFromFireStore('discount');
    var firebaseDiscountsCount = firebaseDiscounts.length;
    //Descuentos en Shopify
    var shopifyDiscounts = await getShopifyDiscountsArray(cant,cursor);
    var shopifyDiscountsCount = shopifyDiscounts.length;
    //Descuentos en Cloudbiz
    var cloudbizDiscounts = await getAllCloudbizDiscounts(token);
    var cloudbizDiscountsCount = cloudbizDiscounts.length;

    console.log(firebaseDiscountsCount);
    console.log(shopifyDiscountsCount);
    console.log(cloudbizDiscountsCount);

    if(cloudbizDiscountsCount > shopifyDiscountsCount && cloudbizDiscountsCount > firebaseDiscountsCount){
      var i = 0;
      cloudbizDiscounts.forEach(async discount => {
        var discountExist = await getDiscountRelationship(null,discount.id);
        if(discountExist == undefined){
          var dateStart = new Date();
          var date = dateStart.getFullYear()+'-'+pad((dateStart.getMonth()+1))+'-'+pad(dateStart.getDate())+'T'+pad(dateStart.getHours())+':'+pad(dateStart.getMinutes()+i)+':'+pad(dateStart.getSeconds())+'Z';
          var variables = await createAutomaticBasicDiscount(discount.name,date,null,discount.rate);
          var queryResult = await graphQLClient(discountCreate,variables);
          console.log(queryResult.discountAutomaticBasicCreate.userErrors);
          //await insertDiscountRelationship(queryResult.discountAutomaticBasicCreate.automaticDiscountNode.id,discount.id);
          status = true;
        }
        i++;
      });
    }else if(cloudbizDiscountsCount < shopifyDiscountsCount && cloudbizDiscountsCount < firebaseDiscountsCount){

    }else if(cloudbizDiscountsCount == shopifyDiscountsCount && cloudbizDiscountsCount == firebaseDiscountsCount){

    }else if(shopifyDiscountsCount > 0 && shopifyDiscountsCount > cloudbizDiscountsCount){
      shopifyDiscountsCount.map(async discount => {

      });
    }

    return status;
  }catch(error){
    console.error(error);
  }
}

const verifyLocationsChangesOnCloudbiz = async() => {
  try{
    const token = await getToken();
    var cant = 10;
    var cursor = null;
    //Datos ya almacenados en firestore
    var firestoreCustomersCreated = await getCollectionDataFromFireStore('location');
    var firestoreCountClients = firestoreCustomersCreated.length;
    //Datos de cloudbiz
    var cloudbizClients = await getCloudbizLocationArray(token);
    var cloudbizCountClients = cloudbizClients.length;
    //Datos de shopify
    var shopifyClients = await getShopifyLocationsArray(cant,cursor);
    var shopifyCountClients = shopifyClients.length;


  }catch(error){
    console.error(error);
  }
}

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
    var shopifyProductVariants = [];
    var shopifyProductsQuery = await graphQLClient(getAllShopifyProducts,variable);
    var haveMore = shopifyProductsQuery.products.pageInfo.hasNextPage;
    var shopifyProducts = [...shopifyProductsQuery.products.edges];
    shopifyProducts.map((product) => {
      shopifyProductVariants.push(...product.node.variants.edges);
    })
    if(haveMore){
      cant += 10;
      var lastElement = shopifyProducts.pop();
      cursor = lastElement.cursor;
      variable = await productsAll(cant,cursor);
      var products = await getShopifyProductsArray(cant,cursor,variable);
      shopifyProductVariants.concat(products);
    }

    return shopifyProductVariants;
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
      getCustomers = await getAllCloudbizCustomers(token,customerCount);
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
      getProducts = await getAllCloudbizProducts(token,productsCount);
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

const getCloudbizLocationArray = async(token,cant = 1) => {
  try{
    var locations = [];
    var getLocation = await getAllCloudbizLocations(token,cant);
    var locationsCount = getLocation.pop().rows;
    if(locationsCount > cant){
      getLocation = await getAllCloudbizLocations(token,locationsCount);
      getLocation.pop();
      getLocation = [...getLocation];
    }
    return locations;
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

const updateCustomerGroupOnShopify = async() => {};

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

const updateDataFromCloudbiz = async () => {
  //await verifyCustomersChangesOnCloudbiz();
  await verifyProductsChangesOnCloudbiz();
  //await verifyCollectionsChangesOnCloudbiz();
  //await verifyDiscountsChangesOnCloudbiz();
}

module.exports = {
  updateDataFromCloudbiz
};
