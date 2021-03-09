import "./FixturesLayout.scss";
import Fixtures from "../components/Fixtures";
import SideTable from "../components/SideTable";
import SideNews from "../components/SideNews";
import Filters from "../components/Filters";

const FixturesLayout = () => {
  return (
    <div className="fixturesLayout">
      <div className="filterContainer">
        <Filters />
      </div>
      <Fixtures />
      <div className="tableAndNewsContainer">
        <SideTable />
        <SideNews />
      </div>
    </div>
  );
};

export default FixturesLayout;
