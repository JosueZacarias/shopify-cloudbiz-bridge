const { gql } = require('graphql-request');

const getAllShopifyDiscounts = gql`query ($cant: Int, $cursor: String){
  automaticDiscountNodes (first: $cant, after: $cursor){
    edges{
      cursor
      node{
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic {
            status
            title
            minimumRequirement{
              ... on DiscountMinimumSubtotal{
                greaterThanOrEqualToSubtotal{
                  amount
                }
              }
              ... on DiscountMinimumQuantity{
              	greaterThanOrEqualToQuantity
              }
            }
            customerGets{
              value {
                ... on DiscountPercentage{
                  percentage
                }
              }
            }
          }
        }
      }
    }
    pageInfo{
      hasNextPage
      hasPreviousPage
    }
  }
}`;

const getAllShopifyCouponDiscounts = gql`query ($cant: Int, $cursor: String){
  codeDiscountNodes (first: $cant, after: $cursor) {
    edges {
      
      node {
        id
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            title
            usageLimit
            appliesOncePerCustomer
            asyncUsageCount
            codeCount
            createdAt
            endsAt
            shortSummary
            startsAt
            status
            summary
            codes (first:10) {
              edges {
                node {
                  code
                }
              }
            }
            customerGets {
              items {
                __typename
                ... on DiscountProducts {
                  products (first:10) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              }
              value {
                ... on DiscountOnQuantity {
                  effect {
                    __typename
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                  quantity {
                    quantity
                  }
                }
                ... on DiscountPercentage{
                  percentage
                }
                ... on DiscountAmount{
                  amount{
                    amount
                  }
                  appliesOnEachItem
                }
              }
            }
            customerSelection {
              __typename
              ... on DiscountCustomerAll {
                allCustomers
              }
              ... on DiscountCustomerSavedSearches{
                savedSearches {
                  id
                  name
                  query
                  searchTerms
                }
              }
              ... on DiscountCustomers{
                customers {
                  id
                }
              }
            }
            
          }
        }
      }
    }
  }
}`;

module.exports = {
  getAllShopifyDiscounts,
  getAllShopifyCouponDiscounts
}