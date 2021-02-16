import "./Header.scss";
import SportsSoccerIcon from "@material-ui/icons/SportsSoccer";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import TableChartIcon from "@material-ui/icons/TableChart";

const Header = () => {
  return (
    <div className="header">
      <ul>
        <li>
          <a href="news">
            <AnnouncementIcon />
            <span>NEWS</span>
          </a>
        </li>

        <li id="activePage">
          <a href="fixtures">
            <SportsSoccerIcon />
            <span>FIXTURES</span>
          </a>
        </li>
        <li>
          <a href="tables">
            <TableChartIcon />
            <span>TABLES</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Header;
