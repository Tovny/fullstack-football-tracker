import "./Header.scss";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SportsSoccerIcon from "@material-ui/icons/SportsSoccer";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import TableChartIcon from "@material-ui/icons/TableChart";

const Header = () => {
  const [activePage, setActivePage] = useState();

  useEffect(() => {
    setActivePage(window.location.pathname);
  }, []);

  return (
    <div className="header">
      <nav>
        <ul>
          <li id={activePage === "/news" ? "activePage" : null}>
            <Link
              to="news"
              onClick={() => {
                setActivePage("/news");
              }}
            >
              <AnnouncementIcon />
              <span>NEWS</span>
            </Link>
          </li>

          <li id={activePage === "/" ? "activePage" : null}>
            <Link
              to="/"
              onClick={() => {
                setActivePage("/");
              }}
            >
              <SportsSoccerIcon />
              <span>FIXTURES</span>
            </Link>
          </li>
          <li id={activePage === "/tables" ? "activePage" : null}>
            <Link
              to="tables"
              onClick={() => {
                setActivePage("/tables");
              }}
            >
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
