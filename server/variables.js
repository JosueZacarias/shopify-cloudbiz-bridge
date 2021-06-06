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

const productCreateMutation = async(descriptionHtml,published,status,tags,title,variants,vendor,productType,images,collectionsToJoin,collectionsToLeave) => {
  let input = {
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

const productUpdateMutation = async(id,descriptionHtml,published,status,tags,title,variants,vendor,productType,images,collectionsToJoin,collectionsToLeave) => {
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

const productVariantVariableMutationCreateUpdate = async( productId,
                                                          sku,
                                                          taxCode,
                                                          taxable,
                                                          title,
                                                          price,
                                                          compareAtPrice,
                                                          imageSrc,
                                                          inventoryItem,
                                                          status = "ACTIVE",
                                                          inventoryItemInput,
                                                          id = null) => {
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
        "status": status,
        "InventoryItemInput": inventoryItemInput
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
        "status": status,
        "InventoryItemInput": inventoryItemInput
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

const productInventoryItemInput = async(cost,tracked ) => {
  return {
    "cost": cost,
    "tracked": tracked
  }
};

/**
 * 
 * @param {String} title 
 * @param {DateTime} startAt 
 * @param {DateTime} endAt 
 * @param {DiscountMinimumRequirementInput} minimumRequirement 
 * @param {DiscountCustomerGetsInput} customerGets 
 * @returns Object
 */
const automaticBasicDiscount = async(title,startAt,endAt,minimumRequirement,customerGets) => {
  return {
    "input":{
      "title": title,
      "startsAt": startAt,
      "endsAt": endAt,
      "minimumRequirement": minimumRequirement,
      "customerGets": customerGets
    }
  }
}

/**
 * 
 * @param {DiscountMinimumQuantityInput} quantity 
 * @param {DiscountMinimumSubtotalInput} subtotal 
 * @returns Object
 */
const DiscountMinimumRequirementInput = async(quantity,subtotal ) => {
  return {
    "quantity": quantity,
    "subtotal": subtotal
  };
};

/**
 * 
 * @param {UnsignedInt64} greaterThanOrEqualToQuantity 
 * @returns Object
 */
const DiscountMinimumQuantityInput = async(greaterThanOrEqualToQuantity ) => {
  return {
    "greaterThanOrEqualToQuantity": greaterThanOrEqualToQuantity
  };
};

/**
 * 
 * @param {Decimal} greaterThanOrEqualToSubtotal 
 * @returns Object
 */
const DiscountMinimumSubtotalInput = async(greaterThanOrEqualToSubtotal ) => {
  return {
    "greaterThanOrEqualToSubtotal":greaterThanOrEqualToSubtotal 
  };
}

/**
 * 
 * @param {Boolean} appliesOnOneTimePurchase 
 * @param {Boolean} appliesOnSubscription 
 * @param {DiscountItemsInput} items 
 * @param {DiscountCustomerGetsValueInput} value 
 * @returns 
 */
const DiscountCustomerGetsInput  = async( appliesOnOneTimePurchase,
                                          appliesOnSubscription,
                                          items,
                                          value 
                                          ) => {
  return {
    "appliesOnOneTimePurchase":appliesOnOneTimePurchase,
    "appliesOnSubscription": appliesOnSubscription,
    "items": items,
    "value": value
  }
};
/**
 * 
 * @param {bolean} all 
 * @param {DiscountCollectionsInput} collections 
 * @param {DiscountProductsInput} products 
 * @returns Object of DiscountItemsInput
 */
const DiscountItemsInput = async (all,collections,products) =>{
  return {
    "all": all,
    "collections": collections,
    "products": products
  };
};
//parámetros son arrays de ID de collections, agregarlos o quitarlos
/**
 * 
 * @param {[ID!] Collection} add 
 * @param {[ID!] Collection} remove 
 * @returns 
 */
const DiscountCollectionsInput = async(add,remove ) => {
  return {
    "add": add,
    "remove": remove
  };
};

//parámetros son arrays de ID de productos o variantes
/**
 * 
 * @param {[ID!] productsVariants} productVariantsToAdd 
 * @param {[ID!] productsVariants} productVariantsToRemove 
 * @param {[ID!] products} productsToAdd 
 * @param {[ID!] products} productsToRemove 
 * @returns 
 */
const DiscountProductsInput = async(productVariantsToAdd,productVariantsToRemove,productsToAdd,productsToRemove) => {
  return {
    "productVariantsToAdd": productVariantsToAdd,
    "productVariantsToRemove": productVariantsToRemove,
    "productsToAdd": productsToAdd,
    "productsToRemove": productsToRemove
  };
};

/**
 * 
 * @param {DiscountAmountInput } discountAmount 
 * @param {DiscountOnQuantityInput} discountOnQuantity 
 * @param {Float} percentage 
 * @returns 
 */
const DiscountCustomerGetsValueInput = async(discountAmount,discountOnQuantity,percentage) => {
  return {
    "discountAmount": discountAmount,
    "discountOnQuantity": discountOnQuantity,
    "percentage": percentage 
  };
};

/**
 * 
 * @param {Decimal} amount 
 * @param {Boolean} appliesOnEachItem 
 * @returns Object
 */
const DiscountAmountInput = async(amount,appliesOnEachItem ) => {
  return {
    "amount": amount,
    "appliesOnEachItem": appliesOnEachItem 
  };
};

/**
 * 
 * @param {DiscountEffectInput} effect 
 * @param {UnsignedInt64} quantity 
 * @returns Object
 */
const DiscountOnQuantityInput  = async(effect,quantity) => {
  return {
    "effect": effect,
    "quantity": quantity
  };
};

/**
 * 
 * @param {Float} percentage 
 * @returns Object
 */
const DiscountEffectInput = async(percentage) => {
  return {
    "percentage": percentage 
  };
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
  productInventoryItemInput,
  automaticBasicDiscount,

  customersAll,
  productsAll
}
