const collectionsAll = async (cant,cursor) => {
    const variables = {
      "cant":cant,
      "cursor":cursor
    };
    return variables;
}

const collectionVariableQuery = async(collectionID) => {
    return {
      "id":collectionID
    }
};
  
const collectionWithProductVariableQuery = async(collectionId,productCount) => {
    return {
      "id":collectionId,
      "productCount":productCount
    }
};

const collectionVariableMutationCreate = async(descriptionHtml,title,id = null) => {
    let input = {};
    //for update collection
    if(id != null){
      input = {
        "input": {
          "descriptionHtml": descriptionHtml?descriptionHtml:"",
          "title": title,
          "id": id
        }
      };
    }else{
      input = {
        "input": {
          "descriptionHtml": descriptionHtml?descriptionHtml:"",
          "title": title
        }
      };
    }
    return input;
};
  
const collectionVariableMutationDelete = async(id) => {
    return {
      "input":{
        "id": id
      }
    }
};

module.exports = {
    collectionsAll,
    collectionVariableMutationCreate,
    collectionVariableMutationDelete,
    collectionVariableQuery,
    collectionWithProductVariableQuery,
}