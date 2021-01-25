const getNews = (payload) => {
  return {
    type: "GET_NEWS",
    payload,
  };
};

export default getNews;
