import "./App.scss";
import { Switch, Route, useLocation } from "react-router-dom";
import FixturesLayout from "./layouts/FixturesLayout";
import Header from "./components/Header";
import Table from "./components/Tables";
import News from "./components/News";
import { CSSTransition, SwitchTransition } from "react-transition-group";

function App() {
  const location = useLocation();

  return (
    <div className="container">
      <div className="headerContainer">
        <Header />
      </div>
      <div className="contentContainer">
        <SwitchTransition>
          <CSSTransition
            key={location.key}
            unmountOnExit
            mountOnEnter
            timeout={200}
            classNames="pageTransition"
          >
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
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
}

export default App;
