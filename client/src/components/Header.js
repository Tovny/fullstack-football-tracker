import "./Header.scss";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SportsSoccerIcon from "@material-ui/icons/SportsSoccer";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import TableChartIcon from "@material-ui/icons/TableChart";

const Header = () => {
  const [activePage, setActivePage] = useState();
  const location = useLocation();

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location]);

  return (
    <div className="header">
      <nav>
        <ul>
          <li id={activePage === "/news" ? "activePage" : null}>
            <Link to="/news">
              <AnnouncementIcon />
              <span>NEWS</span>
            </Link>
          </li>

          <li id={activePage === "/" ? "activePage" : null}>
            <Link to="/">
              <SportsSoccerIcon />
              <span>FIXTURES</span>
            </Link>
          </li>
          <li
            id={
              activePage
                ? activePage.includes("/tables")
                  ? "activePage"
                  : null
                : null
            }
          >
            <Link to="/tables">
              <TableChartIcon />
              <span>TABLES</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
