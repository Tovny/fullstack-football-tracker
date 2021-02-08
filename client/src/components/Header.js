import "./Header.scss";
import SportsSoccerIcon from "@material-ui/icons/SportsSoccer";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import TableChartIcon from "@material-ui/icons/TableChart";

const Header = () => {
  return (
    <div className="header">
      <a href="news">
        <AnnouncementIcon />
        <span>News</span>
      </a>
      <a id="activePage" href="fixtures">
        <SportsSoccerIcon />
        <span>Fixtures</span>
      </a>
      <a href="tables">
        <TableChartIcon />
        <span>Tables</span>
      </a>
    </div>
  );
};

export default Header;
