import "./FixturesLayout.scss";
import Fixtures from "../components/Fixtures";
import SideTable from "../components/SideTable";
import SideNews from "../components/SideNews";
import Filters from "../components/Filters";
import { useState } from "react";

const FixturesLayout = () => {
  const [containerWidth, setContainerWidth] = useState({});

  return (
    <div className="fixturesLayout">
      <div className="filterContainer">
        <Filters />
      </div>
      <Fixtures />
      <div className="tableAndNewsContainer" style={containerWidth}>
        <SideTable setWidth={setContainerWidth} />
        <SideNews containerWidth={containerWidth} />
      </div>
    </div>
  );
};

export default FixturesLayout;
