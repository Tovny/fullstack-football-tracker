const getTables = (payload) => {
  return {
    type: "GET_TABLES",
    payload,
  };
};

export default getTables;
