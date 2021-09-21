const axios = require('axios');
const fetch = require('node-fetch');
const { Headers } = require('cross-fetch');
const {
  getProductRelationship,
  getCustomerRelationship,
  insertProductRelationship,
  insertCustomerRelationship,
  insertLastCollectionSubId,
  deleteProductRelationship,
  deleteCustomerRelationship,
  getLastCollectionSubId,
  insertCollectionRelationship,
  deleteCollectionRelationship,
  getCollectionRelationship,

  getLocationRelationship,
  insertLocationRelationship,
  deleteLocationRelationship,
  getDiscountRelationship,
  deleteDiscountRelationship,

  insertDiscountRelationship
  
} = require('./firestoreQuery.js');

const {
  getProductVariantByIDQuery,
  getProductsLocations,
  getProductsCollections
} = require('./query.js');

const {
  productVariantVariableQuery,
  productLocation,
  productCollection
} = require('./variables.js');

const { graphQLClient, imageResize, getValue } = require('./appFunctions');
const { productCreateMutation } = require('./mutations.js');

global.Headers = global.Headers || Headers;

/**************************/
/*********CLIENTES*********/
/**************************/
//consultar cliente con correo electrónico
const getCustomerIdWithEmail = async (token,email) => {
  try{
    let contact = null;
    const resp = await axios.get('https://api.micloudbiz.com/v1/contact?page=1&email='+email,{
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    if(resp.data.length > 0){
      contact = resp.data[0];
    }
    return contact;
  }catch(err){
    console.log(err);
  }
};
//Crear cliente en cloudBiz
const createCustomer = async (ctx,token) => {
  const customerData = {...ctx.request.body};
  var city = '';
  var address = '';
  var phone_1 = '';
  var createCustomerStatus = false;
  try{
    const exists = await getCustomerRelationship(customerData.admin_graphql_api_id,null);
    if(exists === undefined){
      if(customerData.addresses.length > 0){
        city = customerData.addresses[0]['city'];
        address = customerData.addresses[0]['address1'];
        phone_1 = customerData.addresses[0]['phone'];
      };
      var customerDataObject = {
        is_active : 1,
        seller_id: null,
        discount_id: null,
        is_tax_exempt: (customerData.tax_exempt) ? 1 : 0,
        is_client: 1,
        is_vendor: 0,
        balance_in_favor: 0,
        full_name: customerData.first_name+' '+ customerData.last_name,
        tax_number: '',
        email: customerData.email,
        city: city,
        address: address,
        phone_1: phone_1,
        phone_2: null,
        mobile_phone: customerData.phone,
        notes: customerData.note,
        persons: []
      };
      const createCustomerUrl = `https://api.micloudbiz.com/v1/contact`;
      const methodType= 'POST';
      const cloudbizResponse = await sendCloudbizRequest(createCustomerUrl,methodType,token,customerDataObject);
      if(cloudbizResponse){
        await insertCustomerRelationship(customerData.admin_graphql_api_id,cloudbizResponse.id);
        createCustomerStatus = true;
      }
    }else{
      createCustomerStatus = true;
    }
    return createCustomerStatus;
  }
  catch(err){
    console.log(err);
  }

};
//Actualizar datos del cliente en cloudBiz
const updateCustomer = async (ctx,token) => {
  const customerData = {...ctx.request.body};
  var city = '';
  var address = '';
  var phone_1 = '';
  var customerUpdateStatus = false;
  try{
    shopifyCustomerID = customerData.admin_graphql_api_id;
    const customerReference = await getCustomerRelationship(shopifyCustomerID,null);
    if(customerReference !== undefined){
      const contactID = customerReference.cloudbizReference.toString()
      if(customerData.addresses.length > 0){
        city = customerData.addresses[0]['city'];
        address = customerData.addresses[0]['address1'];
        phone_1 = customerData.addresses[0]['phone'];
      };
      var customerDataObject = {
        is_active : 1,
        seller_id: null,
        discount_id: null,
        is_client: 1,
        is_vendor: 0,
        balance_in_favor: 0,
        is_tax_exempt: (customerData.tax_exempt)?1:0,
        full_name: customerData.first_name+' '+ customerData.last_name,
        tax_number: '',
        email: customerData.email,
        city: city,
        address: address,
        phone_1: phone_1,
        phone_2: null,
        mobile_phone: customerData.phone,
        notes: customerData.note,
        persons: []
      };
      const customerUpdateUrl = `https://api.micloudbiz.com/v1/contact/${contactID}`;
      const methodType = 'PUT';
      const cloudbizResponse = await sendCloudbizRequest(customerUpdateUrl,methodType,token,customerDataObject);
      if(cloudbizResponse && cloudbizResponse.id !== undefined){
        customerUpdateStatus = true;
      }
    }else{
      customerUpdateStatus = await createCustomer(ctx,token);
    }
    return customerUpdateStatus;
  }
  catch(err){
    console.log(err);
  }
};
//Eliminar cliente en cloudBiz
const deleteCustomer = async (ctx,token) => {
  try{
    const deletedCustomer = {...ctx.request.body};
    var deletedCustomerStatus = false;
    const shopifyCustomerID = deletedCustomer.admin_graphql_api_id;
    const customerReference = await getCustomerRelationship(shopifyCustomerID,null);
    const contactID = customerReference.cloudbizReference;
    const customerDeleteUrl = `https://api.micloudbiz.com/v1/contact/${contactID}`;
    const methodType = 'DELETE';
    const cloudbizResponse = await sendCloudbizRequest(customerDeleteUrl,methodType,token);
    if(cloudbizResponse !== undefined){
      await deleteCustomerRelationship(shopifyCustomerID,null);
      deletedCustomerStatus = true;
    }
    return deletedCustomerStatus;
  }catch(err){
      console.log(err);
  }
};

//Esta sección está relacionada con los descuentos en cloudBiz

//Crear grupo de clientes
const createCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};
//Actualizar grupo de clientes
const updateCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};
//Eliminar grupo de clientes
const deleteCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};

/*****************************************/
/*********      FACTURACIÓN      *********/
/*****************************************/

//Tengo que corregir los datos de los productos que vienen de shopify
const createInvoice = async (ctx,token) => {
  try{
    const invoiceData = {...ctx.request.body};
    if(invoiceData.confirmed && invoiceData.financial_status == 'paid'){
      const email = invoiceData.email;
      const subject = 'Factura generado para el cliente: ';
      const emailBody = '<p><b>Su factura ha sido creado</b></p>';
      const shopifyCustomerID = invoiceData.customer.admin_graphql_api_id;
      const customerReference = await getCustomerRelationship(shopifyCustomerID,null);
      var contactID = '59743';//Contacto consumidor final
      if(customerReference && customerReference.cloudbizReference){
        contactID = customerReference.cloudbizReference.toString();
      };
      var cDate = new Date(invoiceData.created_at);
      var creationDateFormat = cDate.getFullYear()+'-'+(cDate.getMonth()+1)+'-'+cDate.getDate()+' '+cDate.getHours()+':'+cDate.getMinutes()+':'+cDate.getSeconds()+' CST';
      var dueDateFormat = creationDateFormat;
      var items = [];
      invoiceData.line_items.forEach((item, i) => {
        let productVariandID = `gid://shopify/ProductVariant/${item.variant_id}`;
        const productInfo = await getProductRelationship(null,productVariandID,null);
        let locationId = `gid://shopify/Location/${item.origin_location.id}`;
        const locationInfo = await getLocationRelationship(locationId,null);
        items.push({
          "item_id": productInfo.cloudbizReference,
          "name": item.name,
          "quantity": item.quantity.toString(),
          "price": item.price.toString(),
          "discount_id": 0,
          "discount_rate": 0,
          "conversion_rate": 1,
          "tax_id": 1125,
          "tax_rate": 0.15,
          "tax_id2": 0,
          "total": (item.quantity*item.price).toString(),
          "notes": null,
          "is_inventory": "1",
          "warehouse_id": locationInfo.cloudbizReference
        })
      });
      var invoiceData = {
        "contact_id": contactID,
        "seller_id": 'OnlineShopify',
        "is_tax_exempt": "0",
        "currency_id": "56",
        "points": [],
        "number_purchase_order": null,
        "sag": null,
        "register": null,
        "points_flow": [],
        "discount_id": null,
        "invoice_number": "",
        "currency_rate": "1",
        "currency_code": "HNL",
        "date": creationDateFormat,
        "due_at": dueDateFormat,
        "items": items,
        "notes": null,
        "terms_conditions": "",
        "is_pos": 1,
        "document_type": null,
        "document_id": null
      };
      const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/invoice',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify(invoiceData)
        }
      );
      const response = await resp.json();
      const invoiceHTMLContent = await getInvoiceWithId(token,response.id);
      if(invoiceHTMLContent){
        let invoicePDF = await getPDF(invoiceHTMLContent);
        let emailSendStatus = await sendEmail(subject,emailBody,email,invoicePDF);
        if(emailSendStatus){
          console.log('Factura recibida correctamente');
        }else{
          console.log('Error al intentar enviar factura por correo');
        }
      }else{
        console.log('Error al obtener la factura');
      }
      return data;
    }
  }catch(err){
    console.log(err);
  }
};

const updateInvoice = async (ctx,token,contactID,invoiceID) => {
  try{
    var cDate = new Date(ctx.request.body.created_at)
    var dDate = new Date(ctx.request.body.updated_at)
    var creationDateFormat = cDate.getFullYear()+'-'+(cDate.getMonth()+1)+'-'+cDate.getDate()+' '+cDate.getHours()+':'+cDate.getMinutes()+':'+cDate.getSeconds()+' CST';
    var dueDateFormat = dDate.getFullYear()+'-'+(dDate.getMonth()+1)+'-'+dDate.getDate()+' '+dDate.getHours()+':'+dDate.getMinutes()+':'+dDate.getSeconds()+' CST';
    var items = [];
    ctx.request.body.line_items.forEach((item, i) => {
      items.push({
        "item_id": item.variant_id,
        "name": item.name,
        "quantity": item.quantity.toString(),
        "price": item.price.toString(),
        "discount_id": 0,
        "discount_rate": 0,
        "conversion_rate": 1,
        "tax_id": 55,
        "tax_rate": 0.15,
        "tax_id2": 0,
        "total": (item.quantity*item.price).toString(),
        "notes": null,
        "is_inventory": "0",
        "warehouse_id": 31
      })
    });
    var invoiceData = {
      "contact_id": contactID,
      "seller_id": null,
      "is_tax_exempt": "0",
      "currency_id": "56",
      "points": [],
      "number_purchase_order": null,
      "sag": null,
      "register": null,
      "points_flow": [],
      "discount_id": null,
      "invoice_number": "",
      "currency_rate": "1",
      "currency_code": "HNL",
      "date": creationDateFormat,
      "due_at": dueDateFormat,
      "items": items,
      "notes": null,
      "terms_conditions": "",
      "is_pos": 1,
      "document_type": null,
      "document_id": null
    };
    const response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/invoice/'+invoiceID,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(invoiceData)
    });
    const data = await response.json();
    return data;
  }catch(err){
    console.log(err);
  }
};

/***************************/
/*********PRODUCTOS*********/
/***************************/
const createProduct = async (ctx,token) => {
  try{
    const productData = {...ctx.request.body};
    var productName = productData.title;
    var productDescription = productData.body_html;
    const productID = productData.admin_graphql_api_id;
    const productVariants = productData.variants;
    var createProductStatus = false;
    
    await Promise.all(productVariants.map(async item => {
      var insertData = await createProductVariantDataToInsert(token,productName,productDescription,item);
      createProductStatus = await createProductVariantOnCloudbiz(token,insertData,productID,item.admin_graphql_api_id);
    }));
    return createProductStatus;
  }catch(err){
    console.log(err);
  }
};

const updateProduct = async (ctx,token) => {
  try{
    //Eliminar en caso de que haya menos variantes
    const productData = {...ctx.request.body};
    var productName = productData.title;
    var productDescription = productData.body_html;
    const productID = productData.admin_graphql_api_id;
    const productVariants = productData.variants;
    var updateProductStatus = false;
    const deleteMethod = `DELETE`;
    const productSavedDocs = await getProductRelationship(productID,null,null);
    if(productSavedDocs !== undefined){
      var productSavedCopy = productSavedDocs;
      let docCount = productSavedDocs.length;
      let variantCount = productVariants.length;
      if(variantCount < docCount){
        productSavedDocs.forEach((item, i) => {
          var dataDoc = item.data();
          if(productVariants[i].id === dataDoc.shopifyVariantReference){
            productSavedCopy.splice(i,1);
          }
        });
        await Promise.all(productSavedCopy.map(async item => {
          var product = item.data();
          var productID = product.cloudbizReference;
          var deleteUrl = `https://apinode.micloudbiz.com/gateway-api/v1/item/${productID}`;
          var data = await sendCloudbizRequest(deleteUrl,deleteMethod,token);
          if(data !== undefined){
            await deleteProductRelationship(null,product.shopifyVariantReference,null);
          }
        }));

        await Promise.all(productVariants.map(async item => {
          var itemDoc = await getProductRelationship(null,item.admin_graphql_api_id,null);
          var itemID = itemDoc[0].data();
          var insertData = await createProductVariantDataToInsert(token,productName,productDescription,item,itemID,false);
          const url = `https://apinode.micloudbiz.com/gateway-api/v1/item/${itemID.cloudbizReference}`;
          const methodType = `PUT`;
          const response = await sendCloudbizRequest(url,methodType,token,insertData);
          if(response !== undefined){
            updateProductStatus = true;
          }
        }));
      }else if(variantCount > docCount){
        await Promise.all(productSavedDocs.map(async item => {
          var product = item.data();
          var productID = product.cloudbizReference;
          var deleteUrl = `https://apinode.micloudbiz.com/gateway-api/v1/item/${productID}`;
          var data = await sendCloudbizRequest(deleteUrl,deleteMethod,token);
          if(data !== undefined){
            await deleteProductRelationship(null,product.shopifyVariantReference,null);
          }
        }));

        await Promise.all(productVariants.map(async item => {
          var insertData = await createProductVariantDataToInsert(token,productName,productDescription,item);
          updateProductStatus = await createProductVariantOnCloudbiz(token,insertData,productID,item.admin_graphql_api_id);
        }));
      }else if(variantCount === docCount){
        await Promise.all(productVariants.map(async item => {
          var itemDoc = await getProductRelationship(null,item.admin_graphql_api_id,null);
          var itemID = itemDoc[0].data();
          var insertData = await createProductVariantDataToInsert(token,productName,productDescription,item,itemID,false);
          const url = `https://apinode.micloudbiz.com/gateway-api/v1/item/${itemID.cloudbizReference}`;
          const methodType = `PUT`;
          const response = await sendCloudbizRequest(url,methodType,token,insertData);
          if(response !== undefined){
            updateProductStatus = true;
          }
        }));
      }
    }else{
      updateProductStatus = await createProduct(ctx,token);
    }
    return updateProductStatus;
  }catch(err){
    console.log(err);
  }
};

const deleteProduct = async (ctx,token) => {
  try{
    const productData = {...ctx.request.body};
    const productID = `gid://shopify/Product/${productData.id}`;
    const productSavedDocs = await getProductRelationship(productID,null,null);
    await Promise.all(productSavedDocs.map(async item => {
      var dataDoc = item.data();
      var response = await fetch(`https://apinode.micloudbiz.com/gateway-api/v1/item/${dataDoc.cloudbizReference}`,{
        method: 'DELETE',
        headers: {
          'Content-Type' : 'application/json',
          'token': token
        }
      });
      var data = await response.json();
      if(data){
        await deleteProductRelationship(null,dataDoc.shopifyVariantReference,null);
      }
    }));
    return true;
  }catch(err){
    console.log(err);
  }
};

const getProductVariantUnitCost = async (productVariantID) => {
  try{
    var unitCost = 0.00;
    const variables = await productVariantVariableQuery(productVariantID);
    var productVariantInfo = await graphQLClient(getProductVariantByIDQuery,variables);
    if(productVariantInfo !== undefined){
      const searchAmount = ["productVariant","inventoryItem","unitCost","amount"];
      unitCost = getValue(searchAmount,productVariantInfo);
      unitCost = (unitCost !== undefined) ? parseFloat(unitCost):0.00;
    }
    return unitCost;
  }catch(err){
    console.log(err);
  }
};

const getProductLocation = async productVariantId => {
  try{
    var locations = [];
    const cant = 10;
    var variables = await productLocation(productVariantId,cant);
    var inventoryInfo = await graphQLClient(getProductsLocations,variables);
    if(inventoryInfo.productVariant != null){
      var edges = inventoryInfo.productVariant.inventoryItem.inventoryLevels.edges;
      locations = await Promise.all(edges.map(async item => {
        var cloudbizLocation = await getLocationRelationship(item.node.location.id,null);
        return {
          initial_stock: item.node.available,
          warehouse_id: cloudbizLocation.cloudbizReference
        };
      }));
    }
    return locations;
  }catch(error){
    console.error(error);
  }
}

const getProductCollection = async productVariantId => {
  try{
    var collections = [];
    const cant = 10;
    var variables = await productCollection(productVariantId,cant);
    var collectionInfo = await graphQLClient(getProductsCollections,variables);
    if(collectionInfo.productVariant != null){
      var edges = collectionInfo.productVariant.product.collections.edges;
      collections = await Promise.all(edges.map(async item => {
        var cloudbizCollection = await getCollectionRelationship(item.node.id,null);
        return {
          id: cloudbizCollection.cloudbizReference
        }
      }));
    }
    return collections;
  }catch(error){
    console.error(error);
  }
}

const sendCloudbizRequest = async(url,methodType,token,productData = '') => {
  try{
    let options = {
      method: methodType,
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    }
    if(productData !== ''){
      options.body = JSON.stringify(productData)
    }
    const resp = await fetch(url,options);
    const response = await resp.json();
    return response;
  }catch(error){
    console.error(error);
  }
}

const createProductVariantOnCloudbiz = async (token,insertData,shopifyProductId,shopifyVariantId) => {
  try{
    var createProductStatus = false;
    const url = `https://apinode.micloudbiz.com/gateway-api/v1/item`;
    const methodType = `POST`;
    const response = await sendCloudbizRequest(url,methodType,token,insertData);
    if(response.id !== undefined){
      const saveProductRelationShip = await insertProductRelationship(shopifyProductId,shopifyVariantId,response.id);
      if(saveProductRelationShip !== undefined){
        createProductStatus = true;
      }
    }
    return createProductStatus;
  }catch(error){
    console.error(error);
  }
}

const createProductVariantDataToInsert = async (token,productName,productDescription,productVariant,itemRelation = null,toCreate = true) => {
  try{
    var prices = [];
    var inventory = {};
    var warehouses = [];
    var imageURL = null;
    var currencyId = '1150';
    var categoryId = "91728";
    const price_list_id = "1325";
    var cost_price = await getProductVariantUnitCost(productVariant.admin_graphql_api_id);
    var locations = await getProductLocation(productVariant.admin_graphql_api_id);
    var collections = await getProductCollection(productVariant.admin_graphql_api_id);
    if(collections.length > 0){
      categoryId = collections[0].id;
    }

    /*productData.images.forEach(image => {
      if(image.id === productVariant.image_id){
        imageURL = imageResize(image.src,200,200);
      }
    });
    if(imageURL === '' && productData.image != null){
      imageURL = imageResize(productData.image.src,200,200);
    }*/

    var variantTitle = productName;
    var reference = '';
    if(productVariant.title != 'Default Title'){
      variantTitle = `${variantTitle} - ${productVariant.title}`;
      reference =  productVariant.title;
    }

    if(toCreate){
      warehouses = [...locations];
      prices.push({
        "id": price_list_id,
        "price": productVariant.price,
        "with_tax": !productVariant.taxable
      });

      inventory = {
        "unit_id": "1322",
        "cost_price": cost_price.toString(),
        "warehouses": warehouses
      }
    }else if(!toCreate && itemRelation !== null){
      var shopifyProductInfo = await getProductInfoFromCloudbiz(token,itemRelation.cloudbizReference);
      var WAREHOUSES_ARRAY = shopifyProductInfo.inventory.warehouses;
      var unitId = shopifyProductInfo.inventory.unit_id;
      var inventoryId = shopifyProductInfo.inventory.id;
      var priceListId = shopifyProductInfo.prices[0].id;
      currencyId = shopifyProductInfo.currency_id;
      WAREHOUSES_ARRAY.forEach(wh => {
        var w  = [...locations.map(location => {
          return {
            "id": wh.id,
            "inventory_id": inventoryId,
            "initial_stock": location.initial_stock,
            "warehouse_id": location.warehouse_id
          };
        },wh).filter(item => {
          return item.warehouse_id == wh.warehouse_id;
        },wh)];
        warehouses.push(w[0]);
      });
      prices.push({
        "id": priceListId,
        "price_list_id": price_list_id,
        "price": productVariant.price.toString(),
        "with_tax": !productVariant.taxable
      });
      inventory = {
        "id": inventoryId,
        "item_id": itemRelation.cloudbizReference,
        "cost_price": cost_price.toString(),
        "unit_id": unitId,
        "initial_stock": productVariant.old_inventory_quantity,
        "available_stock": productVariant.inventory_quantity,
        "warehouses": warehouses
      };
    }

    var ProductData = {
      "type": "product",
      "name": variantTitle,
      "code": productVariant.sku,
      "reference": reference,
      "description": productDescription,
      "category_id": categoryId.toString(),
      "all_discounts": 1,
      "currency_id": currencyId,
      "is_billable": 1,
      "deliver_pack": 0,
      "conversion_factor": "1",
      "only_pack": 0,
      "conversion_rate": 1,
      "prices": prices,
      "is_tax_exempt": 0,
      "taxes": [{"id": 1125}],
      "image": imageURL,
      "inventory": inventory
    };
    return ProductData;
  }catch(error){
    console.error(error);
  }
}

/****************************************/
/*********      CATEGORÍAS      *********/
/****************************************/
const createCategory = async (ctx,token) => {
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
      "name": ctx.request.body.title,
      "description": ctx.request.body.body_html,
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
    if(response){
      const saveCollectionRelationShip = await insertCollectionRelationship(ctx.request.body.admin_graphql_api_id,response.id);
      if(saveCollectionRelationShip){
        await insertLastCollectionSubId(actualId);
        createCollectionStatus = true;
      }
    }
    return createCollectionStatus;
  }catch(err){
    console.log(err);
  }
};

const updateCategory = async (ctx,token) => {
  try{
    var updateCollectionStatus = false;
    await getLastCollectionSubId();
    const id = ctx.request.body.admin_graphql_api_id;
    const categoryId = await getCollectionRelationship(id,null);
    if(categoryId !== null){
      const categoryData = {
        "name":ctx.request.body.title,
        "description":ctx.request.body.body_html
      };
      const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/category/'+categoryId.cloudbizReference,{
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(categoryData)
      });
      const response = await resp.json();
      if(response){
        var lastIdAI = await getLastCollectionSubId();
        actualId = parseInt(lastIdAI)-1;
        await insertLastCollectionSubId(actualId);
        updateCollectionStatus = true;
      }
    }else{
      updateCollectionStatus = await createCategory(ctx,token);
    }

    return updateCollectionStatus;
  }catch(err){
    console.log(err);
  }
};

const deleteCategory = async (ctx,token) => {
  try{
    var deleteStatus = false;
    const id = "gid://shopify/Collection/"+ctx.request.body.id;
    const categoryID = await getCollectionRelationship(id,null);
    const response = await fetch('https://api.micloudbiz.com/v1/category/'+categoryID.cloudbizReference,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    if(data){
      await deleteCollectionRelationship(id,null);
      deleteStatus = true;
    }
    return deleteStatus;
  }catch(err){
      console.log(err);
  }
};

/****************************************/
/*********      SUCURSALES      *********/
/****************************************/

const createLocation = async (ctx,token) => {
  try{
    const locationRequest = {...ctx.request.body};
    var createLocationsStatus = false;
    var locationName = locationRequest.name;
    var notes = locationRequest.phone ? `Teléfono: ${locationRequest.phone}`:``;
    const locationData = {
      "name":locationName,
      "address":locationRequest.address1+ ", "+ locationRequest.address2+ ", "+ locationRequest.city+ ", "+locationRequest.country_name,
      "notes":notes
    };
    const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/warehouse',{
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(locationData)
    });
    const response = await resp.json();
    if(response.id != undefined){
      const saveLocationRelationShip = await insertLocationRelationship(locationRequest.admin_graphql_api_id,response.id);
      if(saveLocationRelationShip){
        createLocationsStatus = true;
      }
    }
    return createLocationsStatus;
  }catch(err){
    console.error(err);
  }
};

const updateLocation = async (ctx,token) => {
  try{
    const locationRequest = {...ctx.request.body};
    var updateLocationsStatus = false;
    var warehouseReference = await getLocationRelationship(locationRequest.admin_graphql_api_id,null);
    if(warehouseReference){
      var locationName = locationRequest.name;
      const locationData = {
        "name":locationName,
        "address":locationRequest.address1+ ", "+ locationRequest.address2+ ", "+ locationRequest.city+ ", "+locationRequest.country_name,
        "notes":"Teléfono: "+ locationRequest.phone
      };
      const resp = await fetch(`https://apinode.micloudbiz.com/gateway-api/v1/warehouse/${warehouseReference.cloudbizReference}`,{
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(locationData)
      });
      const response = await resp.json();
      if(response.id != undefined){
        updateLocationsStatus = true;
      }
    }else{
      updateLocationsStatus = await createLocation(ctx,token);
    }

    return updateLocationsStatus;
  }catch(err){
    console.error(err);
  }
};

const deleteLocation = async (ctx,token) => {
  try{
    var deleteLocationsStatus = false;
    var warehouseReference = await getLocationRelationship(ctx.request.body.admin_graphql_api_id,null);
    const resp = await fetch(`https://apinode.micloudbiz.com/gateway-api/v1/warehouse/${warehouseReference.cloudbizReference}`,{
      method:'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const response = await resp.json();
    if(response != undefined){
      await deleteLocationRelationship(ctx.request.body.admin_graphql_api_id,null);
      deleteLocationsStatus = true;
    }

    return deleteLocationsStatus;
  }catch(err){
    console.error(err);
  }
};

/****************************************/
/*********      DESCUENTOS      *********/
/****************************************/

const createDiscount = async (token,shopifyDiscountId,discountName,discountRate) => {
  try{
    var createDiscountStatus = false;
    const discountData = {
      "name": discountName,
      "rate": discountRate
    };
    const resp = await fetch('https://api.micloudbiz.com/v1/discount',{
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(discountData)
    });
    const response = await resp.json();
    if(response.id != undefined){
      const saved = await insertDiscountRelationship(shopifyDiscountId,response.id);
      if(saved){
        createDiscountStatus = true;
      }
    }
    return createDiscountStatus;
  }catch(err){
    console.error(err);
  }
};

const updateDiscount = async (token,shopifyDiscountId,discountName,discountRate) => {
  try{
    var status = false;
    var discountReference = await getDiscountRelationship(shopifyDiscountId,null);
    const discountData = {
      "name": discountName,
      "rate": discountRate
    };
    const resp = await fetch(`https://api.micloudbiz.com/v1/discount/${discountReference.cloudbizReference}`,{
      method:'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(discountData)
    });
    const response = await resp.json();
    if(response.id != undefined){
      status = true;
    }
    return status;
  }catch(err){
    console.error(err);
  }
};

const deleteDiscount = async (token,shopifyDiscountId) => {
  try{
    var deleteLocationsStatus = false;
    var discountReference = await getDiscountRelationship(shopifyDiscountId,null);
    const resp = await fetch(`https://api.micloudbiz.com/v1/discount/${discountReference.cloudbizReference}`,{
      method:'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const response = await resp.json();
    if(response != undefined){
      await deleteDiscountRelationship(shopifyDiscountId,null);
      deleteLocationsStatus = true;
    }

    return deleteLocationsStatus;
  }catch(err){
    console.error(err);
  }
};

/*Agregar funciones para consulta de datos a cloudbiz*/

const getProductInfoFromCloudbiz = async (token,productID) => {
  try{
    const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item/'+productID,{
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const response = await resp.json();
    return response;
  }catch(err){
    console.log(err);
  }
};

const getCustomerInfoFromCloudbiz = async (token,customerID) => {
  const resp = await fetch('https://api.micloudbiz.com/v1/contact/'+customerID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getCategoryInfoFromCloudbiz = async (token,categoryID) => {
  const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/category/'+categoryID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getAllCategoryInfoFromCloudbiz = async (token) => {
  try{
    const categories = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/category/code/412000',{
      method: 'GET',
      headers: {
        'Content-Type' : 'application/json',
        'token': token
      }
    });
    const response = await categories.json();
    return response;
  }catch(err){
    console.log(err);
  }
};

const getWarehouseInfoFromCloudbiz = async (token,warehouseID) => {
  const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/warehouse/'+warehouseID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getTaxInfoFromCloudbiz = async (token,taxID) => {
  const resp = await fetch('https://api.micloudbiz.com/v1/tax/'+taxID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getDiscountInfoFromCloudbiz = async (token,discountID) => {
  const resp = await fetch('https://api.micloudbiz.com/v1/discount/'+discountID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getUnitInfoFromCloudbiz = async (token,unitID) => {
  const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/unit/'+unitID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getPriceListInfoFromCloudbiz = async (token,priceID) => {
  const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/price/'+priceID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

const getItemInfoFromCloudbiz = async (token,itemID) => {
  const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item/'+itemID,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

/***********************************************/
/*********      DATOS DE CLOUDBIZ      *********/
/***********************************************/
//función para uso interno y obtener códigos de las categorías en cloudbiz
const getCategoriesExistsCodes = async (token) => {
  try{
    const allCategories = await getAllCategoryInfoFromCloudbiz(token);
    let codes = [];
    allCategories.subcategories.forEach((item,i) => {
      codes.push(item.code);
    });
    return codes;
  }catch(err){
    console.log(err);
  }
};

const getAllCloudbizCustomers = async (token,countRow) => {
  try{
    const response = await fetch('https://api.micloudbiz.com/v1/contact?page=1&number_result='+countRow+'&requestRowNumber=true',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    return data;
  }catch(err){
      console.log(err);
  }
};

const getAllCloudbizDiscounts = async (token) => {
  try{
    const response = await fetch('https://api.micloudbiz.com/v1/discount',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    return data;
  }catch(err){
    console.error(err);
  }
}

const getAllCloudbizProducts = async (token,page = 1,cant = 500) => {
  try{
    const response = await fetch(`https://apinode.micloudbiz.com/gateway-api/v1/item?page=${page}&number_result=${cant}&requestRowNumber=true`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    return data;
  }catch(err){
      console.error(err);
  }
}

const getAllCloudbizLocations = async(token,countRow) => {
  try{
    const response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/warehouse?page=1&number_result='+countRow+'&requestRowNumber=true',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    return data;
  }catch(err){
      console.log(err);
  }
}

module.exports = {
    createCustomer,
    createInvoice,
    updateInvoice,
    createProduct,
    updateCustomer,
    updateProduct,
    deleteCustomer,
    getCustomerIdWithEmail,
    
    getAllCloudbizCustomers,
    getAllCloudbizProducts,
    getAllCloudbizDiscounts,
    getAllCategoryInfoFromCloudbiz,
    getAllCloudbizLocations,

    getProductVariantUnitCost,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteProduct,
    getCategoriesExistsCodes,
    createLocation,
    updateLocation,
    deleteLocation,
    createDiscount,
    updateDiscount,
    deleteDiscount
};
