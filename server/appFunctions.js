import { getCustomerVIPType, insertCustomerVIPType, deleteCustomerVIPType } from './firestoreQuery.js';

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

export default {
  verifyCustomerVIPType,
  createCustomerVIPType
};
