const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require('axios');
const Jimp = require('jimp');
const HTMLToPDF = require('convert-html-to-pdf').default;
const { GraphQLClient } = require('graphql-request');
const { getCustomerVIPType, insertCustomerVIPType, deleteCustomerVIPType } = require('./firestoreQuery.js');

const verifyCustomerVIPType = async (tag) => {
  try{
    const tags = tag.split(',');
    const VIPType = tags.find((elem) => {
      return elem.match(/(VIp)[0-9]+/gi) != null;
    });
    const isCreated = await getCustomerVIPType(VIPType,null);
    return isCreated;
  }catch(err){
    console.log(err);
  }
};

const createCustomerVIPType = async (tag) => {
  try{
    const isCreated = await verifyCustomerVIPType(tag);
    if(isCreated == undefined){
      const creation = await insertCustomerVIPType(VIPType,null);
      if(creation){
        console.log('Referencia de tipo de cliente VIP creado con éxito!');
      }else{
        console.log('No se pudo crear referencia de tipos de clientes VIP')
      }
    }else{
      console.log('Existe referencia de tipo de cliente VIP');
    }
    return creation;
  }catch(err){
    console.log(err);
  }
};

/*******************************************************/
/*********      FUNCIONES COMPLEMENTARIAS      *********/
/*******************************************************/
const pad = (number) => {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}
//Token para peticiones a CloudBiz
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
//convertir contenido HTML a PDF
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
    from: `CUBIC <${process.env.MAIL_USERNAME}>`,
    to: toAddresses,
    subject: subject,
    html:mailBody,
    attachments
  };

  let mail = await transporter.sendMail(mailOptions);
  return mail.messageId;
};

const sendEmailToDev = async (subject,mailBody,toAddresses) => {
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
  const mailOptions = {
    from: `CUBIC <${process.env.MAIL_USERNAME}>`,
    to: toAddresses,
    subject: subject,
    html:mailBody
  };

  let mail = await transporter.sendMail(mailOptions);
  return mail.messageId;
};
//Obtener factura con ID de cloudBiz
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
//Consultas de datos a SHOPIFY
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
    console.log("ocurrió un error: "+err);
  }
};


const imageResize = (imageUrl,w,h) => {
  try{
    const newImage = Jimp.read(imageUrl);
    var mime = newImage.getMIME();
    newImage.resize(w, h);
    const base64 = newImage.getBase64(mime, (err, src) => { return src; }); 
    return base64;
  }catch(error){
    console.error(error);
  }
}

const getValue = async (arr, obj)  => {
  const [first, ...rest] = arr;
  if(obj !== null){
    return typeof(obj[first]) === "object" && typeof(obj[first]) !== null ? getValue(rest, obj[first]) : obj[first];
  }else{
    return undefined;
  }
}

module.exports = {
  getPDF,
  getToken,
  sendEmail,
  sendEmailToDev,
  getInvoiceWithId,
  graphQLClient,
  verifyCustomerVIPType,
  createCustomerVIPType,
  pad,
  imageResize,
  getValue
};
