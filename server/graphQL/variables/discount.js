const discountAll = async (cant,cursor) => {
  const variables = {
    "cant":cant,
    "cursor":cursor
  };
  return variables;
}

const couponDiscountAll = async (cant,cursor) => {
  const variables = {
    "cant":cant,
    "cursor":cursor
  };
  return variables;
}

const createAutomaticBasicDiscount = async(title,startAt,endAt,percentage) => {
  var minimumRequirement = {
    "quantity":{
      "greaterThanOrEqualToQuantity": "1"
    }
  };
  
  var customerGets = {
    "value": {
      "percentage": percentage
    },
    "items":{
      "all":true
    }
  };
  const variable = await automaticBasicDiscount(title,startAt,endAt,minimumRequirement,customerGets);
  return variable;
}

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
    "automaticBasicDiscount":{
      "title": title,
      "startsAt": startAt,
      "endsAt": endAt,
      "minimumRequirement": minimumRequirement,
      "customerGets": customerGets
    }
  }
}

module.exports = {
  discountAll,
  couponDiscountAll,
  automaticBasicDiscount,
  createAutomaticBasicDiscount
}