const {database} = require('./firebaseAuth.js');

const customerRelationship = async (cloudbizCustomerID,shopifyCustomerID) => {
  const graphQLID = 'gid://shopify/Customer/'+shopifyCustomerID;
  var reference = await database.ref('customer/'+shopifyCustomerID);
  //var newReference = await reference.push(shopifyCustomerID);
  await reference.set({
    cloudbizReference: cloudbizCustomerID,
    shopifyReference: graphQLID
  });
};

const productRelationship = async (cloudbizProductID,shopifyProductID) => {
  var reference = database.ref('product');
  var newReference = reference.push(shopifyProductID);
  await newReference.set({
    cloudbizReference: cloudbizProductID,
    shopifyReference: shopifyProductID
  });
};

module.exports = {
  customerRelationship,
  productRelationship
};
