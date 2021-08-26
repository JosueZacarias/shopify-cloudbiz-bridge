const productsAll = async(cant,cursor) => {
  const variables = {
    "cant":cant,
    "cursor":cursor
  };
  return variables;
};

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

const productVariableMutationCreate = async(descriptionHtml,
                                            published,
                                            status,
                                            tags,
                                            title,
                                            variants,
                                            vendor,
                                            productType,
                                            images,
                                            collectionsToJoin,
                                            collectionsToLeave) => {
  let input = {
    "input":{
      "descriptionHtml":descriptionHtml,
      "published":published,
      "status":status,
      "tags":tags,
      "title":title,
      "variants":variants,
      "vendor":vendor,
      "productType":productType,
      "collectionsToJoin":collectionsToJoin,
      "collectionsToLeave":collectionsToLeave
    },
    "media": images
  };
  return input;
};

const productVariableMutationUpdate = async(id,descriptionHtml,published,status,tags,title,variants,vendor,productType,images,collectionsToJoin,collectionsToLeave) => {
  let input = {
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
  return input;
};

const productVariableMutationDelete = async(id) => {
  return {
    "input": {
      "id": id
    }
  }
};

const productMediaVariableMutationCreate = async(productId,alt,sourceUrl) =>{
  return {
    "productId": productId,
    "media":[{
      "alt": alt,
      "originalSource": sourceUrl,
      "mediaContentType": IMAGE
    }]
  }
}

const productImageVariableMutationCreate = async(alt,sourceUrl) => {
  return {
    "alt": alt,
    "mediaContentType": "IMAGE",
    "originalSource": sourceUrl
  }
}

const productVariantVariableMutationCreate = async( productId,
                                                    sku,
                                                    taxCode,
                                                    taxable,
                                                    title,
                                                    price,
                                                    compareAtPrice,
                                                    inventoryItem,
                                                    inventoryQuantities,
                                                    imageId
                                                    ) => {
  let input = {
    "input":{
      "productId":productId,
      "sku":sku,
      "taxCode":taxCode,
      "taxable":taxable,
      "title":title,
      "price":price,
      "compareAtPrice":compareAtPrice,
      "inventoryItem":inventoryItem,
      "inventoryQuantities": inventoryQuantities,
      "inventoryManagement": "SHOPIFY",
      "inventoryPolicy": "DENY",
      "imageId": imageId
    }
  }
  return input;
};

const productVariantVariableMutationUpdate = async ( productId,
                                                    sku,
                                                    taxCode,
                                                    taxable,
                                                    title,
                                                    price,
                                                    compareAtPrice,
                                                    imageSrc,
                                                    inventoryItem,
                                                    id) => {
  let input = {
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
      "inventoryManagement": "SHOPIFY",
      "inventoryPolicy": "DENY",
      "status": "ACTIVE"
    }
  }
  return input;
};

const productVariantVariableMutationDelete = async(id) => {
  return {
    "id": id
  }
};

const productInventoryItemInput = async(cost,tracked ) => {
  return {
    "cost": cost,
    "tracked": tracked
  }
};

const productInventoryQuantitiesInput = async(quantity,locationId) => {
  return {
    "availableQuantity": quantity,
    "locationId": locationId
  }
}


module.exports = {
    productsAll,
    productVariableQuery,
    productVariantVariableQuery,
    productVariableMutationDelete,
    productVariantVariableMutationCreate,
    productVariantVariableMutationUpdate,
    productVariantVariableMutationDelete,
    productVariableMutationCreate,
    productVariableMutationUpdate,
    productInventoryItemInput,
    productInventoryQuantitiesInput,
    productMediaVariableMutationCreate,
    productImageVariableMutationCreate,
}