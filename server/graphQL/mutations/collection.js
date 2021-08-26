const { gql } = require('graphql-request');

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

module.exports = {
    collectionCreate,
    collectionUpdate,
    collectionDelete
};