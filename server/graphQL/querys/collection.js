const { gql } = require('graphql-request');

const getAllShopifyCollections = gql`query ($cant: Int, $cursor: String){
  collections(first: $cant, after: $cursor){
    edges{
      cursor
      node{
        description
        descriptionHtml
        id
        productsCount
        title
        updatedAt
      }
    }
    pageInfo{
      hasNextPage
      hasPreviousPage
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
  getCollectionByIdQuery,
  getAllShopifyCollections,
  getCollectionWithProductByIdQuery
}