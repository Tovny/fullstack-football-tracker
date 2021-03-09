const getLeagues = (payload) => {
  return {
    type: "GET_LEAGUES",
    payload,
  };
};

export default getLeagues;
