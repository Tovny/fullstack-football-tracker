const leagueReducer = (state = null, action) => {
  switch (action.type) {
    case "GET_LEAGUES": {
      return action.payload;
    }
    default:
      return state;
  }
};

export default leagueReducer;
