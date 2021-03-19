import "./News.scss";
import { useState, useEffect } from "react";
import { x_auth } from "../config/";
import { useSelector, useDispatch } from "react-redux";
import getNews from "../redux/actions/news-actions";
import LoadingIcon from "./LoadingIcon";
import { format } from "date-fns";

const Articles = () => {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news);
  const [articleNum, setArticleNum] = useState(10);

  useEffect(() => {
    if (!news || news.length < 10 || news.length !== articleNum) {
      (async () => {
        const res = await fetch(
          `https://serene-everglades-51285.herokuapp.com/api/articles?limit=${articleNum}`,
          {
            headers: { "x-auth": x_auth },
          }
        );

        const data = await res.json();

        dispatch(getNews(data));
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleNum]);

  useEffect(() => {
    if (news) {
      let secondLastElt = document.getElementsByClassName("article");
      secondLastElt = secondLastElt[secondLastElt.length - 2];

      const onIntersection = ([entries]) => {
        if (entries.intersectionRatio === 1) {
          setArticleNum(articleNum + 10);

          observer.unobserve(secondLastElt);
        }
      };

      const observer = new IntersectionObserver(onIntersection, {
        threshold: 1,
      });

      observer.observe(secondLastElt);

      return () => {
        observer.unobserve(secondLastElt);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [news]);

  return (
    <div className="articles">
      {news ? (
        news.map((article, i) => {
          const date = new Date(`${article.date} 15:00`);

          return (
            <a
              href={article.url}
              className="article"
              key={i}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="articleImage">
                <img alt={article.title} src={article.image}></img>
              </div>
              <div className="artText">
                <time>{format(date, "iiii, LLL do")}</time>
                <h1>{article.title}</h1>
                <h3>{article.league}</h3>
                <p>{article.description}</p>
              </div>
            </a>
          );
        })
      ) : (
        <LoadingIcon />
      )}
    </div>
  );
};

export default Articles;
