const newsReducer = (state = null, action) => {
  switch (action.type) {
    case "GET_NEWS": {
      return action.payload;
    }
    default:
      return state;
  }
};

export default newsReducer;
