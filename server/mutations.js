const { gql } = require('graphql-request');

const customerCreateUpdate = gql`mutation ($input: CustomerInput!) {
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

const productCreateUpdate = gql`mutation ($input: ProductInput!) {
  productCreate(input: $input) {
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

const productDelete = gql`mutation ($input: ProductDeleteInput!) {
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

const productVariantCreateUpdate = gql`mutation ($input: ProductVariantInput!) {
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

const collectionCreateUpdate = gql`mutation ($input: CollectionInput!) {
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

module.exports = {
  customerCreateUpdate,
  customerDelete,
  productCreateUpdate,
  productDelete,
  productVariantCreateUpdate,
  productVariantDelete,
  collectionCreateUpdate,
  collectionDelete
};
