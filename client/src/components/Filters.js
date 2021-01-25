import "./Filters.scss";
import { useState, useEffect, useRef } from "react";
import x_auth from "../config/default";
import { useSelector, useDispatch } from "react-redux";
import getLeagues from "../redux/actions/league-actions";
import setFixtures from "../redux/actions/fixture-actions";
import { setFilters } from "../redux/actions/filter-actions";
import ClearIcon from "@material-ui/icons/Clear";

const Filters = () => {
  const dispatch = useDispatch();
  const leagues = useSelector((state) => state.leagues);
  const globalFilters = useSelector((state) => state.filters);
  const [selectedLeague, setSelectedLeague] = useState(0);
  const selectedRef = useRef(null);
  const fulltimeRef = useRef(null);

  const [selectedFilters, setSelectedFilters] = useState({
    innerLeagueValue: "|||0",
    league: "",
    team: "",
    hometeam: "",
    awayteam: "",
    matchday: "",
    status: "",
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:5000/leagues`, {
        method: "GET",
        headers: {
          "x-auth": x_auth,
        },
      });

      const data = await res.json();
      dispatch(getLeagues(data));
    })();
  }, [dispatch]);

  useEffect(() => {
    if (selectedRef.current && fulltimeRef.current) {
      if (selectedFilters.status !== "scheduled")
        selectedRef.current.checked = false;
      if (selectedFilters.status !== "full-time")
        fulltimeRef.current.checked = false;
    }
  }, [selectedFilters]);

  useEffect(() => {
    if (globalFilters.date !== "all") {
      setSelectedFilters({
        innerLeagueValue: "|||0",
        league: "",
        team: "",
        hometeam: "",
        awayteam: "",
        matchday: "",
        status: "",
      });
    }
  }, [globalFilters.date]);

  const handleSubmit = (event) => {
    event.preventDefault();
    delete selectedFilters.innerLeagueValue;
    if (selectedFilters.hometeam && selectedFilters.awayteam) {
      delete selectedFilters.matchday;
      delete selectedFilters.status;
    }
    dispatch(setFilters(selectedFilters));
    dispatch(setFixtures([])); //FIXES THE ALL MATCHES PROBLEM, BUT SHOULD LOOK FOR A BETTER SOLUTION
  };

  const handleChange = (event, key) => {
    setSelectedFilters({
      ...selectedFilters,
      [key]: event.target.value,
    });
  };

  const handleClick = (key) => {
    setSelectedFilters({
      ...selectedFilters,
      [key]: "",
    });
  };

  return leagues ? (
    <div className="filtersContainer">
      <form onSubmit={(event) => handleSubmit(event)}>
        <h4>Filter by League</h4>
        <div className="selectContainer">
          <select
            onChange={(event) => {
              setSelectedFilters({
                league: event.target.value.split("|||")[0],
                innerLeagueValue: event.target.value,
                date: "all",
                team: "",
                hometeam: "",
                awayteam: "",
                matchday: "",
                status: "",
              });
              setSelectedLeague(event.target.value.split("|||")[1]);
            }}
            value={selectedFilters.innerLeagueValue}
          >
            <option value="|||0" hidden>
              Select League
            </option>
            {leagues.map((league, i) => {
              return (
                <option value={`${league.league}|||${i}`}>
                  {league.league}
                </option>
              ); // RETARDED SOLUTION, NEED TO FIX LATER
            })}
          </select>
          {selectedFilters.league ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => {
                setSelectedLeague(0);
                setSelectedFilters({
                  league: "",
                  innerLeagueValue: "|||0",
                  date: "all",
                  team: "",
                  hometeam: "",
                  awayteam: "",
                  matchday: "",
                  status: "",
                });
              }}
            />
          ) : null}
        </div>
        <h4>Filter by Team</h4>
        <div className="selectContainer">
          <select
            disabled={
              !selectedFilters.league ||
              selectedFilters.hometeam ||
              selectedFilters.awayteam
            }
            value={selectedFilters.team}
            onChange={(event) => handleChange(event, "team")}
          >
            <option value="" hidden>
              Select Team
            </option>
            {leagues[selectedLeague].teams.map((team) => {
              return <option value={team}>{team}</option>;
            })}
          </select>
          {selectedFilters.team ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => handleClick("team")}
            />
          ) : null}
        </div>
        <h4>Filter by Home Team</h4>
        <div className="selectContainer">
          <select
            disabled={!selectedFilters.league || selectedFilters.matchday}
            onChange={(event) => handleChange(event, "hometeam")}
            value={selectedFilters.hometeam}
          >
            <option value="" hidden>
              Select Home Team
            </option>
            {leagues[selectedLeague].teams.map((team) => {
              return <option value={team}>{team}</option>;
            })}
          </select>
          {selectedFilters.hometeam ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => handleClick("hometeam")}
            />
          ) : null}
        </div>
        <h4>Filter by Away Team</h4>
        <div className="selectContainer">
          <select
            disabled={!selectedFilters.league || selectedFilters.matchday}
            onChange={(event) => handleChange(event, "awayteam")}
            value={selectedFilters.awayteam}
          >
            <option value="" hidden>
              Select Away Team
            </option>
            {leagues[selectedLeague].teams.map((team) => {
              return <option value={team}>{team}</option>;
            })}
          </select>
          {selectedFilters.awayteam ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => handleClick("awayteam")}
            />
          ) : null}
        </div>
        <h4>Filter by Matchday</h4>
        <div className="sliderContainer">
          <input
            class="slider"
            disabled={
              !selectedFilters.league ||
              selectedFilters.hometeam ||
              selectedFilters.awayteam ||
              selectedFilters.status
            }
            type="range"
            min="1"
            max="38"
            value={selectedFilters.matchday}
            onInput={(event) => handleChange(event, "matchday")}
          ></input>
          {selectedFilters.matchday ? selectedFilters.matchday : null}
          {selectedFilters.matchday ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => handleClick("matchday")}
            />
          ) : null}
        </div>
        <h4>Filter by Status</h4>
        <div className="radioBtnContainer">
          <input
            ref={selectedRef}
            disabled={
              selectedFilters.matchday ||
              (selectedFilters.hometeam && selectedFilters.awayteam) ||
              !selectedFilters.league
            }
            type="radio"
            id="scheduled"
            name="status"
            value="scheduled"
            onChange={(event) => handleChange(event, "status")}
          ></input>
          <label for="scheduled">Scheduled</label>
          <input
            ref={fulltimeRef}
            disabled={
              selectedFilters.matchday ||
              (selectedFilters.hometeam && selectedFilters.awayteam) ||
              !selectedFilters.league
            }
            type="radio"
            id="fullTime"
            name="status"
            value="full-time"
            onClick={(event) => handleChange(event, "status")}
          ></input>
          <label for="full-time">Full Time</label>
          {selectedFilters.status ? (
            <ClearIcon
              id="clearFilterBtn"
              onClick={() => handleClick("status")}
            />
          ) : null}
        </div>
        <input
          type="submit"
          disabled={!selectedFilters.league}
          value="Apply Filters"
        ></input>
      </form>
    </div>
  ) : null;
};

export default Filters;
