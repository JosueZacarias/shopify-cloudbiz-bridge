const { gql } = require('graphql-request');

const productCreateMutation = gql`mutation ($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        images(first: 10){
          edges{
            node{
              id
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
}`;
  
const productUpdateMutation = gql`mutation ($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
      }
      shop{
        id
      }
      userErrors {
        field
        message
      }
    }
}`;
  
const productDeleteMutation = gql`mutation ($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      shop {
        id
      }
      userErrors {
        field
        message
      }
    }
}`;
  
const productVariantCreate = gql`mutation ($input: ProductVariantInput!) {
    productVariantCreate(input: $input) {
      product {
        id
      }
      productVariant {
        id
      }
      userErrors {
        field
        message
      }
    }
}`;
  
const productVariantUpdate = gql`mutation ($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        id
      }
      productVariant {
        id
      }
      userErrors {
        field
        message
      }
    }
}`;
  
const productVariantDelete = gql`mutation ($id: ID!) {
    productVariantDelete(id: $id) {
      deletedProductVariantId
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
}`;

const productMediaCreate = gql`mutation ($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        alt
      }
      mediaUserErrors {
        code
        field
        message
      }
      product {
        id
      }
    }
}`;

module.exports = {
    productCreateMutation,
    productUpdateMutation,
    productDeleteMutation,
    productMediaCreate,
    productVariantCreate,
    productVariantUpdate,
    productVariantDelete
};