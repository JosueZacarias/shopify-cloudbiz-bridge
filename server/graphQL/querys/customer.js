const { gql } = require('graphql-request');

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

const getAllShopifyCustomers = gql`query ($cant: Int, $cursor: String){
  customers(first:$cant, after: $cursor){
    edges{
      cursor
      node{
        id
        email
      }
    }
    pageInfo{
      hasNextPage
      hasPreviousPage
    }
  }
}`;

module.exports = {
  getCustomerByIdQuery,
  getAllShopifyCustomers
}