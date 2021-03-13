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

  return (
    <div className="container">
      {!location.pathname.includes("match") ? (
        <div className="headerContainer">
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
