import { useState, useEffect } from "react";
import x_auth from "../config/default";

const Articles = () => {
  const [articles, setAricles] = useState();

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/articles", {
        headers: { "x-auth": x_auth },
      });

      setAricles(await res.json());
    })();
  }, []);

  return (
    <div className="articles">
      {articles ? (
        articles.map((art) => {
          return (
            <div href={art.url} className="article">
              <img src={art.image} alt=""></img>
              <div className="artText">
                <h1>{art.title}</h1>
                <span>{art.league}</span>
                <p>{art.description}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p>no shit</p>
      )}
    </div>
  );
};

export default Articles;
