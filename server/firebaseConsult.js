const {database} = require('./firebaseAuth.js');

const getCustomerFirebase = async (shopifyCustomerID) => {
  const customerRef = database.ref('customer');
  //var data;
  customerRef.orderByChild('shopifyReference').equalTo(shopifyCustomerID).on('value',(snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      }
      else {
        console.log("No data available");
      }
    }
  );
  /*var data = await customerRef.child(shopifyCustomerID).get().then(function(snapshot) {
    if (snapshot.exists()) {
      return snapshot.val();
    }
    else {
      console.log("No data available");
    }
  }).catch(function(error) {
    console.error(error);
  });*/
  console.log(data);
  return data;
};

const getProductFirebase = async (shopifyProductID) => {};

module.exports = {
  getCustomerFirebase,
  getProductFirebase
};
