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
      cursor
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
  getCustomerByIdQuery,
  
  getAllShopifyCustomers,
  getAllShopifyProducts,
  getAllShopifyCollections,
  getAllShopifyDiscounts,
  getAllShopifyCouponDiscounts,
  getAllShopifyLocations
};
