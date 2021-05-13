const HTMLToPDF = require('convert-html-to-pdf').default;
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require('axios');
const fetch = require('node-fetch');
const { Headers } = require('cross-fetch');
const { GraphQLClient, gql } = require('graphql-request');
const {
  getProductFirestore,
  getCustomerFirestore,
  insertProductRelationship,
  insertCustomerRelationship,
  deleteProductRelationship,
  deleteCustomerRelationship,
} = require('./firestoreQuery.js');

const {
  getProductVariantByIDQuery
} = require('./query.js');

const {
  productVariantVariableQuery
} = require('./variables.js')

global.Headers = global.Headers || Headers;

const getToken = async () => {
    try {
      dotenv.config();
        const resp = await axios.post('https://api.micloudbiz.com/v1/auth/login',{
            "email": process.env.CLOUDBIZ_USER,"password":process.env.CLOUDBIZ_PASSWORD
          },{
            headers: {
              'Content-Type': 'application/json',
              'token': process.env.CLOUDBIZ_TOKEN
            }
          }
        );
        return resp.data.token;
    } catch (err) {
        console.error(err);
    }
};

const getInvoiceWithId = async (token,invoiceId) => {
  try{
    const resp = await axios.get('https://apinode.micloudbiz.com/gateway-api/v1/print/document/invoice/'+invoiceId,{
      headers: {
        'token': token
      }
    });
    return resp.data;
  }catch(err){
    console.log(err);
  }
};

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

const createCustomerWithParams = async (token,params) => {
  try{
    var customerData = {
      is_active : 1,
      seller_id: null,
      discount_id: null,
      is_client: 1,
      is_vendor: 0,
      balance_in_favor: 0,
      full_name: params.full_name,
      tax_number: '',
      email: params.email,
      city: params.city,
      address: params.address,
      phone_1: params.phone_1,
      phone_2: params.phone_2,
      mobile_phone: params.phone,
      notes: params.note,
      persons: []
    };
    const resp = await axios.post('https://api.micloudbiz.com/v1/contact',customerData,{
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      }
    );
    return resp.data;
  }catch(err){
    console.log(err);
  }
};

const createCustomer = async (ctx,token) => {
  var city = '';
  var address = '';
  var phone_1 = '';
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
    }
    return response;
  }
  catch(err){
    console.log(err);
  }

};

const updateCustomer = async (ctx,token) => {
  var city = '';
  var address = '';
  var phone_1 = '';
  try{
    shopifyCustomerID = ctx.request.body.admin_graphql_api_id;
    const customerReference = await getCustomerFirestore(shopifyCustomerID,null);
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

const deleteCustomer = async (token,contactID) => {
  try{
    const response = await fetch('https://api.micloudbiz.com/v1/contact/'+contactID,{
      method: 'DELETE',
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

//Sección relacionado a los descuentos en cloudbiz
const createCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};

const updateCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};

const deleteCustomerGroup = async (ctx,token) => {
  try{

  }catch(err){
    console.log(err);
  }
};

const getPDF = async (htmlContent) => {
   const htmlToPDF = new HTMLToPDF(htmlContent);

   try {
     const pdf = await htmlToPDF.convert();
     return pdf;
   } catch (err) {
     console.log('Error al convertir a PDF');
   }
 };

//Cambiar el remitente ya para producción
const sendEmail = async (subject,mailBody,toAddresses,pdf) => {
  let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
        expires: 1484314697598
      }
    });
  let attachments = { filename: "factura.pdf", content: pdf }
  const mailOptions = {
    from: "INVERSIONES ZACARÍAS <josuej.zacariasg@gmail.com>",
    to: toAddresses,
    subject: subject,
    html:mailBody,
    attachments
  };

  let mail = await transporter.sendMail(mailOptions);
  return mail.messageId;
};

//Tengo que corregir los datos de los productos que vienen de shopify
const createInvoice = async (ctx,token,contactID) => {
  try{
    if(ctx.request.body.confirmed && ctx.request.body.financial_status == 'paid'){
      const email = 'jeffryj.zacarias@gmail.com';//ctx.request.body.email;
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
    var code = [44203,31048];
    var itemName = ["Tinta Negra","Planchado express"];
    ctx.request.body.line_items.forEach((item, i) => {
      items.push({
        "item_id": code[i],
        "name": itemName[i],
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
    const resp = await axios.post('https://apinode.micloudbiz.com/gateway-api/v1/invoice'+invoiceID,invoiceData,{
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      }
    );
    return resp.data;
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
                "id": "1084",
                "price": item.price,
                "with_tax": !item.taxable
            }
        ],
        "is_tax_exempt": 0,
        "taxes": [
            {
                "id": 55
            }
        ],
        "image": imageURL,
        "inventory": {
            "unit_id": "27",
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
    const productSavedDocs = await getProductFirestore(ctx.request.body.admin_graphql_api_id,null,null);
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
      let itemDoc = await getProductFirestore(null,item.admin_graphql_api_id,null);
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
    const productID = 'gid://shopify/Product/'+ctx.request.body.id;
    const productSavedDocs = await getProductFirestore(productID,null,null);
    productSavedDocs.forEach(async(item, i) => {
      var dataDoc = item.data();
      var response = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/item/'+dataDoc.cloudbizReference,{
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

const createCategory = async(ctx,token) => {
  try{
    var createCollectionStatus = false;
    const categoryData = {

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
      }
    }

    return createCollectionStatus;
  }catch(err){
    console.log(err);
  }
};

const updateCategory = async(ctx,token) => {
  try{
    var updateCollectionStatus = false;
    const categoryData = {

    };
    const resp = await fetch('https://apinode.micloudbiz.com/gateway-api/v1/category',{
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

const deleteCategory = async(ctx,token) => {
  try{
    var deleteStatus = false;
    const id = ctx.request.body.admin_graphql_api_id;
    const categoryID = await getCollectionRelationship(id,null);
    const response = await fetch('https://api.micloudbiz.com/v1/category/'+categoryID,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });
    const data = await response.json();
    if(data){
      const deleteResult = await deleteCollectionRelationship(id,null);
      if(deleteResult){
        deleteStatus = true
      }
    }
    return deleteStatus;
  }catch(err){
      console.log(err);
  }
};

const callGetClients = async (token,idate,fdate) => {
  try{
    const response = await fetch('https://api.micloudbiz.com/v1/contact?begin_date='+idate+'&end_date='+fdate,{
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

const graphQLClient = async (query,variables) => {
  try{
    const graphqlQuery = new GraphQLClient(`https://${process.env.SHOP_NAME}/admin/api/2021-04/graphql.json`,{
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.ACCESS_TOKEN_SHOPIFY
      }
    });
    const queryData = await graphqlQuery.request(query,variables);
    return queryData;
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
  const resp = await fetch('https://api.micloudbiz.com/v1/contact/'+customerId,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  });
  const response = await resp.json();
  return response;
};

module.exports = {
    getPDF,
    getToken,
    sendEmail,
    createCustomer,
    createInvoice,
    createProduct,
    updateCustomer,
    updateProduct,
    deleteCustomer,
    getInvoiceWithId,
    getCustomerIdWithEmail,
    createCustomerWithParams,
    callGetClients,
    graphQLClient,
    getProductVariantUnitCost
};
