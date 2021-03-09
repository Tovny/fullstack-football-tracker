import "./News.scss";
import { useState, useEffect } from "react";
import { x_auth, PORT } from "../config/";
import { useSelector, useDispatch } from "react-redux";
import getNews from "../redux/actions/news-actions";
import LoadingIcon from "./LoadingIcon";
import { format } from "date-fns";

const Articles = () => {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news);
  const [articles, setArticles] = useState(null);

  useEffect(() => {
    if (!news) {
      (async () => {
        const res = await fetch(`http://localhost:${PORT}/articles`, {
          headers: { "x-auth": x_auth },
        });

        const data = await res.json();

        dispatch(getNews(data));
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (news) {
      const temp = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date(`${news[i].date} 15:00`);

        temp.push(
          <a
            href={news[i].url}
            className="article"
            key={i}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="articleImage">
              <img alt={news[i].title} src={news[i].image}></img>
            </div>
            <div className="artText">
              <time>{format(date, "iiii, LLL do")}</time>
              <h1>{news[i].title}</h1>
              <h3>{news[i].league}</h3>
              <p>{news[i].description}</p>
            </div>
          </a>
        );
      }

      setArticles(temp);
    }
  }, [news]);

  useEffect(() => {
    if (articles) {
      let secondLastElt = document.getElementsByClassName("article");
      secondLastElt = secondLastElt[secondLastElt.length - 2];

      const onIntersection = (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio === 1) {
            const temp = [];
            for (let i = articles.length; i < articles.length + 9; i++) {
              const date = new Date(`${news[i].date} ${news[i].time}`);

              temp.push(
                <div
                  onClick={() => window.open(news[i].url)}
                  className="article"
                  key={i}
                >
                  <div className="articleImage">
                    <img alt={news[i].title} src={news[i].image}></img>
                  </div>
                  <div className="artText">
                    <time>{format(date, "iiii, LLL do")}</time>
                    <h1>{news[i].title}</h1>
                    <h3>{news[i].league}</h3>
                    <p>{news[i].description}</p>
                  </div>
                </div>
              );
            }

            setArticles([...articles, ...temp]);

            observer.unobserve(secondLastElt);
          }
        });
      };

      const observer = new IntersectionObserver(onIntersection, {
        threshold: 1,
      });

      observer.observe(secondLastElt);
    }
  }, [articles, news]);

  return (
    <div className="articles">{articles ? articles : <LoadingIcon />}</div>
  );
};

export default Articles;
