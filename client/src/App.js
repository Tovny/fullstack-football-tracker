import "./App.scss";
import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import FixturesLayout from "./layouts/FixturesLayout";
import Header from "./components/Header";
import Table from "./components/Tables";
import News from "./components/News";
import MatchInfo from "./components/MatchInfo";

function App() {
  const location = useLocation();
  const [stickyHeader, setStickyHeader] = useState(false);
  const headerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(null);

  useEffect(() => {
    if (location.pathname === "/") {
      const currentHeader = headerRef.current;

      const observer = new IntersectionObserver(
        ([entries]) => {
          setStickyHeader(entries.intersectionRatio < 0.01);
        },
        {
          threshold: 0.01,
        }
      );

      observer.observe(currentHeader);

      return () => observer.unobserve(currentHeader);
    }
  }, [location.pathname]);

  useEffect(() => {
    const setSize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <div
      className={
        stickyHeader &&
        location.pathname === "/" &&
        windowWidth > 600 &&
        windowWidth <= 992
          ? "container sticky"
          : "container"
      }
    >
      {!location.pathname.includes("match") ? (
        <div ref={headerRef} className="headerContainer">
          <Header />
        </div>
      ) : null}
      <div className="contentContainer">
        <Switch location={location}>
          <Route path="/tables:table?">
            <Table />
          </Route>
          <Route exact path="/">
            <FixturesLayout />
          </Route>
          <Route exact path="/news">
            <News />
          </Route>
        </Switch>
        <Route path="/match/:league?/:hometeam?/:awayteam">
          <MatchInfo />
        </Route>
      </div>
    </div>
  );
}

export default App;
