const locationAll = async (cant,cursor) => {
  const variables = {
    "cant":cant,
    "cursor":cursor
  };
  return variables;
}

module.exports = {
  locationAll
}