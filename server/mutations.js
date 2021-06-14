const { gql } = require('graphql-request');

const customerCreate = gql`mutation ($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const customerUpdate = gql`mutation ($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const customerDelete = gql`mutation ($input: CustomerDeleteInput!) {
  customerDelete(input: $input) {
    deletedCustomerId
    shop {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

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

const discountCreate = gql`mutation ($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const discountUpdate = gql`mutation ($input: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicUpdate(input: $input) {
    automaticDiscountNode {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const discountDelete = gql`mutation ($id: ID) {
  discountAutomaticDelete(id: $id) {
    deletedAutomaticDiscountId
    userErrors {
      field
      message
    }
  }
}`;

const collectionCreate = gql`mutation ($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const collectionUpdate = gql`mutation ($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;

const collectionDelete = gql`mutation ($input: CollectionDeleteInput!) {
  collectionDelete(input: $input) {
    deletedCollectionId
    shop {
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
  customerCreate,
  customerUpdate,
  customerDelete,
  productCreateMutation,
  productUpdateMutation,
  productDeleteMutation,
  productMediaCreate,
  productVariantCreate,
  productVariantUpdate,
  productVariantDelete,
  discountCreate,
  discountUpdate,
  discountDelete,
  collectionCreate,
  collectionUpdate,
  collectionDelete
};
