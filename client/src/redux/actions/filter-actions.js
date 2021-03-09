export const getFilters = (payload) => {
  return {
    type: "GET_FILTERS",
    payload,
  };
};

export const setFilters = (payload) => {
  return {
    type: "SET_FILTERS",
    payload,
  };
};
