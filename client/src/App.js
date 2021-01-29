import "./App.scss";
import FixturesLayout from "./layouts/FixturesLayout";
import Header from "./components/Header";

function App() {
  return (
    <div className="container">
      <div className="headerContainer">
        <Header />
      </div>
      <div className="contentContainer">
        <FixturesLayout />
      </div>
    </div>
  );
}

export default App;
