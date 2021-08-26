const { gql } = require('graphql-request');

const getAllShopifyLocations = gql`query ($cant: Int, $cursor: String){
  locations(first: $cant, after: $cursor){
    edges{
      cursor
      node{
        id
        name
        isActive
        hasActiveInventory
        activatable
      }
    }
    pageInfo{
      hasNextPage
      hasPreviousPage
    }
  }
}`;

module.exports = {
  getAllShopifyLocations
}