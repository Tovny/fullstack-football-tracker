import "./SideNews.scss";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { x_auth } from "../config/";
import { useSelector, useDispatch } from "react-redux";
import getNews from "../redux/actions/news-actions";

const SideNews = () => {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://serene-everglades-51285.herokuapp.com/api/articles?limit=10`,
        {
          headers: { "x-auth": x_auth },
        }
      );

      const data = await res.json();
      dispatch(getNews(data));
    })();
  }, [dispatch]);

  return news ? (
    <div className="sideNewsContainer">
      <h4>Latest Football News</h4>
      <NewsArticle article={news[0]} />
      <NewsArticle article={news[1]} />
      <NewsArticle article={news[2]} />
      <NewsArticle article={news[3]} />
      <div className="newsLinkContainer">
        <Link to="/news">More Football News</Link>
      </div>
    </div>
  ) : null;
};

const NewsArticle = ({ article }) => {
  const { url, title, image } = article;

  const sliceTitle = (title) => {
    let finalTitle = "";
    const slices = title.split(" ");

    for (let slice of slices) {
      if (finalTitle.length < 55) {
        finalTitle = finalTitle + " " + slice;
      } else {
        finalTitle = finalTitle + "...";

        break;
      }
    }
    return finalTitle;
  };
  return (
    <a className="article" href={url} target="_blank" rel="noopener noreferrer">
      <h5>{title.length > 60 ? sliceTitle(title) : title}</h5>
      <div
        className="articleImage"
        style={{ backgroundImage: `url(${image})`, backgroundSize: "cover" }}
      ></div>
    </a>
  );
};

export default SideNews;
