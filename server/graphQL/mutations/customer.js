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

module.exports = {
    customerCreate,
    customerUpdate,
    customerDelete
};