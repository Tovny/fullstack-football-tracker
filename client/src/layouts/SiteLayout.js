import "./SiteLayout.scss";
import FixturesLayout from "./FixturesLayout";
import Header from "../components/Header";

const SiteLayout = () => {
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
};

export default SiteLayout;
