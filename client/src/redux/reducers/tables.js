const tablesReducer = (state = null, action) => {
  switch (action.type) {
    case "GET_TABLES": {
      return action.payload;
    }
    default:
      return state;
  }
};

export default tablesReducer;
