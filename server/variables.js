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




module.exports = {
  
}
