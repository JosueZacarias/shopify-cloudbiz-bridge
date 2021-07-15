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
  getProductVariantByIDQuery
} = require('./query.js');

const {
  productVariantVariableQuery
} = require('./variables.js');

const { graphQLClient } = require('./appFunctions');

global.Headers = global.Headers || Headers;

/**************************************/
/*********      CLIENTES      *********/
/**************************************/
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
  var city = '';
  var address = '';
  var phone_1 = '';
  var createCustomerStatus = false;
  try{
    if(ctx.request.body.addresses.length > 0){
      city = ctx.request.body.addresses[0]['city'];
      address = ctx.request.body.addresses[0]['address1'];
      phone_1 = ctx.request.body.addresses[0]['phone'];
    };
    var customerData = {
      is_active : 1,
      seller_id: null,
      discount_id: null,
      is_tax_exempt: (ctx.request.body.tax_exempt)?1:0,
      is_client: 1,
      is_vendor: 0,
      balance_in_favor: 0,
      full_name: ctx.request.body.first_name+' '+ ctx.request.body.last_name,
      tax_number: '',
      email: ctx.request.body.email,
      city: city,
      address: address,
      phone_1: phone_1,
      phone_2: null,
      mobile_phone: ctx.request.body.phone,
      notes: ctx.request.body.note,
      persons: []
    };
    const resp = await fetch('https://api.micloudbiz.com/v1/contact',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body:JSON.stringify(customerData)
      }
    );
    const response = await resp.json();
    if(response){
      await insertCustomerRelationship(ctx.request.body.admin_graphql_api_id,response.id);
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
  var city = '';
  var address = '';
  var phone_1 = '';
  try{
    shopifyCustomerID = ctx.request.body.admin_graphql_api_id;
    const customerReference = await getCustomerRelationship(shopifyCustomerID,null);
    if(customerReference){
      const contactID = customerReference.cloudbizReference.toString()
      if(ctx.request.body.addresses.length > 0){
        city = ctx.request.body.addresses[0]['city'];
        address = ctx.request.body.addresses[0]['address1'];
        phone_1 = ctx.request.body.addresses[0]['phone'];
      };
      var customerData = {
        is_active : 1,
        seller_id: null,
        discount_id: null,
        is_client: 1,
        is_vendor: 0,
        balance_in_favor: 0,
        is_tax_exempt: (ctx.request.body.tax_exempt)?1:0,
        full_name: ctx.request.body.first_name+' '+ ctx.request.body.last_name,
        tax_number: '',
        email: ctx.request.body.email,
        city: city,
        address: address,
        phone_1: phone_1,
        phone_2: null,
        mobile_phone: ctx.request.body.phone,
        notes: ctx.request.body.note,
        persons: []
      };
      const response = await fetch('https://api.micloudbiz.com/v1/contact/'+contactID,{
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify(customerData)
        }
      );
      const data = await response.json();
      return data;
    }
  }
  catch(err){
    console.log(err);
  }
};
//Eliminar cliente en cloudBiz
const deleteCustomer = async (ctx,token) => {
  try{
    var deletedCustomerStatus = false;
    const shopifyCustomerID = ctx.request.body.admin_graphql_api_id;
    const customerReference = await getCustomerRelationship(shopifyCustomerID,null);
    const contactID = customerReference.cloudbizReference;
    const response = await fetch('https://api.micloudbiz.com/v1/contact/'+contactID,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    if(data){
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
const createInvoice = async (ctx,token,contactID) => {
  try{
    if(ctx.request.body.confirmed && ctx.request.body.financial_status == 'paid'){
      const email = ctx.request.body.email;
      const subject = 'Factura generado para el cliente: ';
      const emailBody = '<p><b>Su factura ha sido creado</b></p>';
      var cDate = new Date(ctx.request.body.created_at)
      var creationDateFormat = cDate.getFullYear()+'-'+(cDate.getMonth()+1)+'-'+cDate.getDate()+' '+cDate.getHours()+':'+cDate.getMinutes()+':'+cDate.getSeconds()+' CST';
      var dueDateFormat = creationDateFormat;
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

/***************************************/
/*********      PRODUCTOS      *********/
/***************************************/
const createProduct = async (ctx,token) => {
  try{
    var productName = ctx.request.body.title;
    var createProductStatus = false;
    ctx.request.body.variants.forEach(async(item, i) => {
      var imageURL = '';
      var cost_price = await getProductVariantUnitCost(item.admin_graphql_api_id);
      ctx.request.body.images.forEach((image, j) => {
        if(image.id == item.image_id){
          imageURL = image.src;
        }
      });
      var variantTitle = productName;
      var reference = '';
      if(item.title != 'Default Title'){
        variantTitle = variantTitle+" - "+item.title;
        reference =  item.title;
      }
      var productData = {
        "type": "product",
        "name": variantTitle,
        "code": item.sku,
        "reference": reference,
        "description": ctx.request.body_html,
        "category_id": "1401",
        "all_discounts": 1,
        "currency_id": "56",
        "is_billable": 1,
        "deliver_pack": 0,
        "conversion_factor": "1",
        "only_pack": 0,
        "conversion_rate": 1,
        "prices": [
            {
                "id": "1325",
                "price": item.price,
                "with_tax": !item.taxable
            }
        ],
        "is_tax_exempt": 0,
        "taxes": [
            {
                "id": 1125
            }
        ],
        "image": imageURL,
        "inventory": {
            "unit_id": "1322",
            "cost_price": cost_price,
            "warehouses": [
                {
                    "initial_stock": item.inventory_quantity,
                    "warehouse_id": "1207"
                }
            ]
        }
      };
      const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(productData)
      });
      const response = await resp.json();
      if(response){
        const saveProductRelationShip = await insertProductRelationship(ctx.request.body.admin_graphql_api_id,item.admin_graphql_api_id,response.id);
        if(saveProductRelationShip){
          createProductStatus = true;
        }
      }
    });
    return createProductStatus;
  }catch(err){
    console.log(err);
  }
};

const updateProduct = async (ctx,token) => {
  try{
    //variantes quitados
    const productSavedDocs = await getProductRelationship(ctx.request.body.admin_graphql_api_id,null,null);
    var productSavedCopy = productSavedDocs;
    const productVariants = ctx.request.body.variants;
    let docCount = productSavedDocs.length;
    let variantCount = productVariants.length;
    if(variantCount < docCount){
      productSavedDocs.forEach((item, i) => {
        var dataDoc = item.data();
        if(variantCount <= docCount){
          if(productVariants[i].id == dataDoc.shopifyVariantReference){
            productSavedCopy.splice(i,1);
          }
        }
      });
      productSavedCopy.forEach(async(item, i) => {
        var product = item.data();
        var productID = product.cloudbizReference;
        var response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item/'+productID,{
          method: 'DELETE',
          headers: {
            'Content-Type' : 'application/json',
            'token': token
          }
        });
        var data = await response.json();
        if(data){
          await deleteProductRelationship(null,product.shopifyVariantReference,null);
        }
      });

    }
    //variantes quitados
    var productName = ctx.request.body.title;
    var createProductStatus = false;
    ctx.request.body.variants.forEach(async(item, i) => {
      var imageURL = '';
      var cost_price = await getProductVariantUnitCost(item.admin_graphql_api_id);
      ctx.request.body.images.forEach((image, j) => {
        if(image.id == item.image_id){
          imageURL = image.src;
        }
      });
      var variantTitle = productName;
      var reference = '';
      if(item.title != 'Default Title'){
        variantTitle = variantTitle+" - "+item.title;
        reference =  item.title;
      }
      let itemDoc = await getProductRelationship(null,item.admin_graphql_api_id,null);
      let itemID = itemDoc[0].data();
      var shopifyProductInfo = await getProductInfoFromCloudbiz(token,itemID.cloudbizReference);
      var categoryId = shopifyProductInfo.category_id;
      var currencyId = shopifyProductInfo.currency_id;
      var unitId = shopifyProductInfo.inventory.unit_id;
      var priceId = shopifyProductInfo.prices[0].id;
      var priceListId = shopifyProductInfo.prices[0].price_list.id;
      var inventoryId = shopifyProductInfo.inventory.id;
      var warehousesId = shopifyProductInfo.inventory.warehouses[0].id;
      var warehouseID = shopifyProductInfo.inventory.warehouses[0].warehouse.id;
      var productData = {
          "name": variantTitle,
          "code": item.sku,
          "reference": reference,
          "description": ctx.request.body_html,
          "prices": [
              {
                  "price_list_id": priceListId,
                  "price": item.price.toString(),
                  "id": priceId,
                  "with_tax": !item.taxable
              }
          ],
          "inventory": {
              "id": inventoryId,
              "cost_price": cost_price,
              "initial_stock": item.inventory_quantity,
              "warehouses":[
                {
                  "id": warehousesId,
                  "inventory_id": inventoryId,
                  "warehouse_id": warehouseID,
                  "initial_stock": item.inventory_quantity
                }
              ]
          }
      };
      const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item/'+itemID.cloudbizReference,{
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(productData)
      });
      const response = await resp.json();
      if(response){
        createProductStatus = true;
      }
    });
    return createProductStatus;
  }catch(err){
    console.log(err);
  }
};

const deleteProduct = async (ctx,token) => {
  try{
    const productID = ctx.request.body.admin_graphql_api_id;
    const productSavedDocs = await getProductRelationship(productID,null,null);
    productSavedDocs.forEach(async(item, i) => {
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
    });
    return true;
  }catch(err){
    console.log(err);
  }
};

const getProductVariantUnitCost = async (productVariantID) => {
  try{
    const variables = await productVariantVariableQuery(productVariantID);
    var productVariantInfo = await graphQLClient(getProductVariantByIDQuery,variables);
    const unitCost = parseFloat(productVariantInfo.productVariant.inventoryItem.unitCost.amount);
    return unitCost;
  }catch(err){
    console.log(err);
  }
};

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
      "parent_id": 1401
      //"parent_id": 91727
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
        createCollectionStatus = true;
        await insertLastCollectionSubId(actualId);
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
      updateCollectionStatus = true;
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
    var createLocationsStatus = false;
    var locationName = ctx.request.body.name;
    const locationData = {
      "name":locationName,
      "address":ctx.request.body.address1+ ", "+ ctx.request.body.address2+ ", "+ ctx.request.body.city+ ", "+ctx.request.body.country_name,
      "notes":"Teléfono: "+ ctx.request.body.phone
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
      const saveLocationRelationShip = await insertLocationRelationship(ctx.request.body.admin_graphql_api_id,response.id);
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
    var updateLocationsStatus = false;
    var warehouseReference = await getLocationRelationship(ctx.request.body.admin_graphql_api_id,null);
    var locationName = ctx.request.body.name;
    const locationData = {
      "name":locationName,
      "address":ctx.request.body.address1+ ", "+ ctx.request.body.address2+ ", "+ ctx.request.body.city+ ", "+ctx.request.body.country_name,
      "notes":"Teléfono: "+ ctx.request.body.phone
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

const getAllCloudbizProducts = async (token,countRow) => {
  try{
    const response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item?page=1&number_result='+countRow+'&requestRowNumber=true',{
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

const getAllCloudbizLocations = async(token) => {
  try{
    const response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/warehouse',{
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
