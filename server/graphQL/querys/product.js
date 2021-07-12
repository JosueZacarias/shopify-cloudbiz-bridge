const { gql } = require('graphql-request');

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

const getAllShopifyProducts = gql`query ($cant: Int, $cursor: String){
  products(first: $cant, after:$cursor){
    edges{
      cursor
      node{
        id
        description
        descriptionHtml
      }
    }
    pageInfo{
      hasNextPage
      hasPreviousPage
    }
  }
}`;

module.exports = {
  getProductByIDQuery,
  getAllShopifyProducts,
  getProductVariantByIDQuery
}