const { gql } = require('graphql-request');

const getInventoryByIDQuery = gql`query ($id: ID!){
  inventoryItem(id: $id){
    unitCost{
      amount
    }
  }
}`;

const getProductByIDQuery = gql`query ($id: ID!){
  product(id: $id){
    title
  }
}`;

const getProductVariantByIDQuery = gql`query ($id: ID!){
  productVariant(id: $id){
    displayName,
    inventoryItem{
      unitCost{
        amount
      }
    }
  }
}`;

const getCustomerByIdQuery = gql`query ($id: ID!){
  customer(id: $id){
    email,
    displayName,
    firstName,
    lastName,
    phone,
    acceptsMarketing
  }
}`;

const getCustomerVipTypeByNameQuery = gql`query ($query: String){
  customerSavedSearches(first: 1, query: $query){
    edges{
      node{
        id
        name
        query
        searchTerms
      }
    }
  }
}`;

const getCollectionByIdQuery = gql`query ($id: ID!){
	collection(id: $id){
    description
    descriptionHtml
    productsCount
    title
  }
}`;

const getCollectionWithProductByIdQuery = gql`query ($id: ID!, $productCount: Int!){
	collection(id: $id){
    products(first:$productCount) {
      edges {
        node {
          id
        }
      }
    }
  }
}`;


module.exports = {
  getProductByIDQuery,
  getInventoryByIDQuery,
  getProductVariantByIDQuery,
  getCustomerByIdQuery
};
