const Router = require('koa-router');
const axios = require('axios');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const customRouter = new Router();
const {
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
  createCategory,
  updateCategory,
  deleteCategory,
  deleteProduct,
  createLocation,
  updateLocation,
  deleteLocation
} = require('./apiClient');
const {
  getProductFirestore,
  getCustomerFirestore,
  deleteCustomerRelationship,
} = require('./firestoreQuery.js');
const {
  getProductByIDQuery,
  getInventoryByIDQuery 
} = require('./query.js');

//EndPoints Terminados Inicio
customRouter.get('/api/v1/invoice/getInvoice',
  async (ctx) => {
    ctx.response.statusCode = 200;
    var id_invoice = 425356;
    const emailSubject = 'Su factura ha sido generado';
    const emailBody = '<p>Muchas Gracias por su compra</p>';
    var emailSend = 'jeffryj.zacarias@gmail.com';
    const token = await getToken();
    const invoice = await getInvoiceWithId(token,id_invoice);
    if(invoice){
      let invoicePDF = await getPDF(invoice);
      let emailSendStatus = await sendEmail(emailSubject,emailBody,emailSend,invoicePDF);
      if(emailSendStatus){
        console.log('Factura recibida correctamente');
      }else{
        console.log('Error al intentar enviar factura por correo');
      }
    }else{
      console.log('Error al obtener la factura');
    }
  }
);

customRouter.post('/api/v1/customer/createCustomer',
  async (ctx) => {
    //Consulta servicio para obtener token de acceso a cloudbiz
    ctx.res.statusCode = 200;
    const token = await getToken();
    const customer = await createCustomer(ctx,token);
    if(customer){
      console.log('Contacto creado con éxito con id: '+ customer.id);
    }else{
      console.log('Error en la creación de contacto');
    }
  }
);

customRouter.post('/api/v1/customer/updateCustomer',
    async (ctx) => {
      ctx.res.statusCode = 200;
      const email = ctx.request.body.email;
      const token = await getToken();
      const customer = await updateCustomer(ctx,token);
      if(customer){
        console.log('Actualizado Correctamente');
      }else{
        console.log('Error al actualizar contacto ' + email);
      }
    }
);

customRouter.post('/api/v1/customer/deleteCustomer',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const customer = await deleteCustomer(ctx,token);
    if(customer){
      console.log('Contacto Eliminado Correctamente');
    }else{
      console.log('Error al eliminar contacto');
    }
  }
);

customRouter.post('/api/v1/invoice/createInvoice',
  async (ctx) => {
    ctx.status = 200;
    const token = await getToken();
    const email = ctx.request.body.email;
    const subject = 'Factura generado para el cliente: ';
    const emailBody = '<p><b>Su factura ha sido creado</b></p>';
    const shopifyCustomerID = ctx.request.body.customer.admin_graphql_api_id;
    const customerReference = await getCustomerFirestore(shopifyCustomerID,null);
    var contactID = '22996';//Contacto consumidor final
    if(customerReference){
      contactID = customerReference.cloudbizReference.toString();
    };
    var cDate = new Date(ctx.request.body.created_at)
    var dDate = new Date(ctx.request.body.updated_at)
    var creationDateFormat = cDate.getFullYear()+'-'+(cDate.getMonth()+1)+'-'+cDate.getDate()+' '+cDate.getHours()+':'+cDate.getMinutes()+':'+cDate.getSeconds()+' CST';
    var dueDateFormat = dDate.getFullYear()+'-'+(dDate.getMonth()+1)+'-'+dDate.getDate()+' '+dDate.getHours()+':'+dDate.getMinutes()+':'+dDate.getSeconds()+' CST';
    var items = [];
    ctx.request.body.line_items.forEach(async(item, i) => {
      let admin_graphql_api_id = "gid://shopify/ProductVariant/"+item.variant_id;
      const productInfo = await getProductFirestore(null,admin_graphql_api_id,null);
      items.push({
        "item_id": productInfo.cloudbizReference,
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
    var invoiceOptions = {
      'method': 'post',
      'url': 'https://apinode.micloudbiz.com/gateway-api/v1/invoice',
      'headers': {
        'Content-Type': 'application/json',
        'token': token
      },
      data: JSON.stringify(invoiceData)
    };
    axios(invoiceOptions).then( async (response) => {
      const invoiceHTMLContent = await getInvoiceWithId(token,response.data.id);
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
    }).catch((err) => {
      if(err){
        console.log('Ocurrió un error al crear factura ' + err);
      }
    });
  }
);

customRouter.post('/api/v1/inventory/createProduct',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const create = await createProduct(ctx,token);
    if(create){
      console.log('Item o producto creado con éxito');
    }else{
      console.log('Error en la creación de Item o Producto');
    }
  }
);

customRouter.post('/api/v1/inventory/updateProduct',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const updated = await updateProduct(ctx,token);
    if(updated){
      console.log('Actualizado correctamente');
    }else{
      console.log('Error al actualizar producto');
    }
  }
);

customRouter.post('/api/v1/inventory/deleteProduct',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const delProduct = await deleteProduct(ctx,token);
    if(delProduct){
      console.log('Item o product Eliminado con éxito');
    }else{
      console.log('Error al intentar eliminar Item o producto');
    }
  }
);

customRouter.post('/api/v1/category/createCategory',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const result = await createCategory(ctx,token);
    if(result){
      console.log('Creación de categoría o colección realizado con éxito!!');
    }else{
      console.log('Error al crear categoría o colección');
    }
  }
);

customRouter.post('/api/v1/category/updateCategory',
  async(ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const result = await updateCategory(ctx,token);
    if(result){
      console.log('Actualización de categoría o colección realizado con éxito!!');
    }else{
      console.log('Error al actualizar categoría o colección');
    }
  }
);

customRouter.post('/api/v1/category/deleteCategory',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const result = await deleteCategory(ctx,token);
    if(result){
      console.log('Eliminación de categoría o colección realizado con éxito!!');
    }else{
      console.log('Error al eliminar categoría o colección');
    }
  }
);

customRouter.post('/api/v1/customer/createLocation',
  async (ctx) => {
    //Consulta servicio para obtener token de acceso a cloudbiz
    ctx.res.statusCode = 200;
    const token = await getToken();
    const location = await createLocation(ctx,token);
    if(location){
      console.log('Bodega o Locación creada con éxito');
    }else{
      console.error('Error en la creación de bodega o locación');
    }
  }
);

customRouter.post('api/v1/customer/updateLocation',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const location = await updateLocation(ctx,token);
    if(location){
      console.log('Bodega o Locación actualizada con éxito');
    }else{
      console.error('Error en la actualización de bodega o locación');
    }
  }
);

customRouter.post('api/v1/customer/deleteLocation',
  async (ctx) => {
    ctx.res.statusCode = 200;
    const token = await getToken();
    const location = await deleteLocation(ctx,token);
    if(location){
      console.log('Bodega o Locación eliminada con éxito');
    }else{
      console.error('Error en la eliminación de bodega o locación');
    }
  }
);
//EndPoints Terminados Final

//EndPoints Pendientes de Desarrollo Inicio
customRouter.post('/api/v1/invoice/updateInvoice',
  async (ctx) => {
    const token = getToken();

  }
);

customRouter.post('/api/v1/invoice/deleteInvoice',
  async (ctx) => {

  }
);

customRouter.post('/api/v1/customer/createCustomerGroup',
  async (ctx) => {
    const token = await getToken();
    const result = await createCustomerGroup(ctx,token);
    if(result){
      console.log('Creación de grupo de clientes creado con éxito');
    }else{
      console.log('Error en la creación de grupo de clientes');
    }
  }
);

customRouter.post('/api/v1/customer/updateCustomerGroup',
  async (ctx) => {
    const token = await getToken();
    const result = await updateCustomerGroup(ctx,token);
    if(result){
      console.log('Actualización de grupo de clientes creado con éxito');
    }else{
      console.log('Error al actualizar grupo de clientes');
    }
  }
);

customRouter.post('/api/v1/customer/deleteCustomerGroup',
  async (ctx) => {
    const token = await getToken();
    const result = await deleteCustomerGroup(ctx,token);
    if(result){
      console.log('Eliminación de grupo de clientes creado con éxito');
    }else{
      console.log('Error de eliminación de grupo de clientes');
    }
  }
);



//EndPoints Pendientes de Desarrollo Fin


module.exports = {
    customRouter
}
