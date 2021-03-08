import "./Header.scss";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ImNewspaper } from "react-icons/im";
import { GiSoccerBall } from "react-icons/gi";
import { ImTable } from "react-icons/im";

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
              <ImNewspaper />
              <span>NEWS</span>
            </Link>
          </li>

          <li id={activePage === "/" ? "activePage" : null}>
            <Link to="/">
              <GiSoccerBall />
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
              <ImTable />
              <span>TABLES</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
