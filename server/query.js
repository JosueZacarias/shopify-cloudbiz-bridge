const { gql } = require('graphql-request');

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




module.exports = {
  getCustomerVipTypeByNameQuery
};
