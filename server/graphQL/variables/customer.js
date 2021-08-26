const customersAll = async (cant,cursor) => {
    var variables = {
      "cant":cant,
      "cursor":cursor
    };
    return variables;
};

const customerVariableQuery = async (customerID) => {
    return {
      "id":customerID
    }
};
  
const customerVIPVariableQuery = async(queryString) =>{
    return {
      "query":queryString
    }
};

const customerVariableMutationCreate = async (email,firstName,lastName,phone1,phone2,address1,city,id = null) => {
    let input = {};
    if(id != null){
        input = {
            "input": {
                "id": id,
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "phone": phone1,
                "addresses":
                { "address1": address1,
                    "city": city,
                    "firstName": firstName,
                    "lastName": lastName,
                    "phone": phone2
                }
            }
        };
    }else{
        input = {
            "input": {
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "phone": phone1,
                "addresses":
                { "address1": address1,
                    "city": city,
                    "firstName": firstName,
                    "lastName": lastName,
                    "phone": phone2
                }
            }
        };
    }
    return input;
};
  
const customerVariableMutationDelete = async(id) => {
    return {
        "input":{
            "id": id
        }
    }
};

module.exports = {
    customersAll,
    customerVariableQuery,
    customerVIPVariableQuery,
    customerVariableMutationCreate,
    customerVariableMutationDelete,
}