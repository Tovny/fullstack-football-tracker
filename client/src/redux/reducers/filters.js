const date = new Date();

const filterReducer = (state = { date: date }, action) => {
  switch (action.type) {
    case "GET_FILTERS": {
      return state;
    }
    case "SET_FILTERS": {
      return { date: state.date, ...action.payload };
    }
    default:
      return state;
  }
};

export default filterReducer;
