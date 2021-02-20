import "./App.scss";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FixturesLayout from "./layouts/FixturesLayout";
import Header from "./components/Header";
import Table from "./components/Tables";

function App() {
  return (
    <Router>
      <div className="container">
        <div className="headerContainer">
          <Header />
        </div>
        <div className="contentContainer">
          <Switch>
            <Route path="/tables">
              <Table />
            </Route>
            <Route exact path="/">
              <FixturesLayout />
            </Route>
            <Route exact path="/news">
              <div>news</div>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
