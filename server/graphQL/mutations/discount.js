const { gql } = require('graphql-request');

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

module.exports = {
  discountCreate,
  discountUpdate,
  discountDelete
};