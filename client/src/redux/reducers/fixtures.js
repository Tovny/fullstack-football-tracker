const fixturesReducer = (state = null, action) => {
  switch (action.type) {
    case "SET_FIXTURES": {
      return action.payload;
    }
    default:
      return state;
  }
};

export default fixturesReducer;
