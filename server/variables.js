//SECCIÓN DE VARIABLES DE CONSULTA
const productVariableQuery = async (productID) => {
  return {
    "id":productID
  }
};

const productVariantVariableQuery = async(productVariantID) => {
  return {
    "id":productVariantID
  }
};

const inventoryVariableQuery = async(inventoryID) => {
  return {
    "id":inventoryID
  }
};

const customerVariableQuery = async (customerID) => {
  return {
    "id":customerID
  }
};

const customerVIPVariableQuery = async(queryString) =>{
  return {
    "query":queryString
  }
};

const collectionVariableQuery = async(collectionID) => {
  return {
    "id":collectionID
  }
};

const collectionWithProductVariableQuery = async(collectionId,productCount) => {
  return {
    "id":collectionId,
    "productCount":productCount
  }
};

const customersAll = async (cant,cursor) => {
  var variables;
  if(cursor == null){
    variables = {
      "cant":cant
    };
  }else if(cursor !== null){
    variables = {
      "cant":cant,
      "cursor":cursor
    };
  }
  return variables;
};

const productsAll = async(cant,cursor) => {
  var variables;
  if(cursor == null){
    variables = {
      "cant":cant
    };
  }else if(cursor !== null){
    variables = {
      "cant":cant,
      "cursor":cursor
    };
  }
  return variables;
};

//SECCIÓN DE VARIABLES DE ESCRITURA O MUTACIONES
const customerVariableMutationCreate = async (email,firstName,lastName,phone1,phone2,address1,city,id = null) => {
  let input = {};
  if(id != null){
    input = {
      "input": {
                "id": id,
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "phone": phone1,
                "addresses":
                  { "address1": address1,
                    "city": city,
                    "firstName": firstName,
                    "lastName": lastName,
                    "phone": phone2
                  }
      }
    };
  }else{
    input = {
      "input": {
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "phone": phone1,
                "addresses":
                  { "address1": address1,
                    "city": city,
                    "firstName": firstName,
                    "lastName": lastName,
                    "phone": phone2
                  }
      }
    };
  }
  return input;
};

const customerVariableMutationDelete = async(id) => {
  return {
    "input":{
      "id": id
    }
  }
};

const productVariableMutationCreateUpdate = async(descriptionHtml,published,status,tags,title,variants,vendor,productType,images,collectionsToJoin,collectionsToLeave,id = null ) => {
  let input = {};
  if(id != null){
    input = {
      "id": id,
      "descriptionHtml":descriptionHtml,
      "published":published,
      "status":status,
      "tags":tags,
      "title":title,
      "variants":variants,
      "vendor":vendor,
      "productType":productType,
      "images":images,
      "collectionsToJoin":collectionsToJoin,
      "collectionsToLeave":collectionsToLeave
    };
  }else{
    input = {
      "descriptionHtml":descriptionHtml,
      "published":published,
      "status":status,
      "tags":tags,
      "title":title,
      "variants":variants,
      "vendor":vendor,
      "productType":productType,
      "images":images,
      "collectionsToJoin":collectionsToJoin,
      "collectionsToLeave":collectionsToLeave
    };
  }
  return input;
};

const productImageVariableMutationCreate = async (altImage,externalSource,mediaContentType = "IMAGE") => {
  let createMediaInput = {
    "createMediaInput": {
      "alt": altImage,
      "mediaContentType": mediaContentType,
      "originalSource": externalSource
    }
  };
  return createMediaInput;
};

const productVariableMutationDelete = async(id) => {
  return {
    "input": {
      "id": id
    }
  }
};

const productVariantVariableMutationCreateUpdate = async(productId,sku,taxCode,taxable,title,price,compareAtPrice,imageSrc,inventoryItem,status = "ACTIVE",id = null) => {
  let input = {};
  if(id != null){
    input = {
      "input":{
        "id": id,
        "productId":productId,
        "sku":sku,
        "taxCode":taxCode,
        "taxable":taxable,
        "title":title,
        "price":price,
        "compareAtPrice":compareAtPrice,
        "imageSrc":imageSrc,
        "inventoryItem":inventoryItem,
        "status": status
      }
    }
  }else{
    input = {
      "input":{
        "productId":productId,
        "sku":sku,
        "taxCode":taxCode,
        "taxable":taxable,
        "title":title,
        "price":price,
        "compareAtPrice":compareAtPrice,
        "imageSrc":imageSrc,
        "inventoryItem":inventoryItem,
        "status": status
      }
    }
  }
  return input;
};

const productVariantVariableMutationDelete = async(id) => {
  return {
    "id": id
  }
};

const collectionVariableMutationCreate = async(descriptionHtml,title,products,id = null) => {
  let input = {};
  //for update collection
  if(id != null){
    input = {
      "input": {
        "descriptionHtml": descriptionHtml,
        "products": products,
        "title": title,
        "id": id
      }
    };
  }else{
    input = {
      "input": {
        "descriptionHtml": descriptionHtml,
        "products": products,
        "title": title
      }
    };
  }
  return input;
};

const collectionVariableMutationDelete = async(id) => {
  return {
    "input":{
      "id": id
    }
  }
};

module.exports = {
  productVariableQuery,
  productVariantVariableQuery,
  inventoryVariableQuery,
  customerVariableQuery,
  customerVIPVariableQuery,
  collectionVariableQuery,
  collectionWithProductVariableQuery,

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
}
