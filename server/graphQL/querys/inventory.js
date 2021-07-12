const { gql } = require('graphql-request');

const getInventoryByIDQuery = gql`query ($id: ID!){
  inventoryItem(id: $id){
    unitCost{
      amount
    }
  }
}`;


module.exports = {
  getInventoryByIDQuery
}