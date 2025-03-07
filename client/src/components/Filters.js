import "./Filters.scss";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { x_auth } from "../config/";
import { useSelector, useDispatch } from "react-redux";
import getLeagues from "../redux/actions/league-actions";
import { setFilters } from "../redux/actions/filter-actions";
import { BsFilterRight } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { CSSTransition } from "react-transition-group";

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
  const [openFilters, setOpenFilters] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (openFilters) {
      document.getElementsByClassName("container")[0].style.transform =
        "translateX(-10%)";
      document.getElementsByClassName("container")[0].style.WebkitTransform =
        "translateX(-10%)";
      document.getElementsByClassName("container")[0].style.MozTransform =
        "translateX(-10%)";
      if (window.innerWidth <= 992) {
        document.getElementsByTagName("html")[0].scrollTop = 0;
        document.getElementsByTagName("html")[0].className = "noScroll";
        document.getElementsByTagName("body")[0].className = "noScroll";
      }
    } else {
      document.getElementsByClassName("container")[0].style.transform = null;
      document.getElementsByClassName(
        "container"
      )[0].style.WebkitTransform = null;
      document.getElementsByClassName("container")[0].style.MozTransform = null;

      document.getElementsByTagName("html")[0].classList.remove("noScroll");
      document.getElementsByTagName("body")[0].classList.remove("noScroll");
    }
  }, [openFilters]);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://serene-everglades-51285.herokuapp.com/api/leagues`,
        {
          method: "GET",
          headers: {
            "x-auth": x_auth,
          },
        }
      );

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

    setOpenFilters(false);

    dispatch(setFilters(selectedFilters));
  };

  const handleChange = (
    event,
    key,
    resetKey1 = null,
    resetKey2 = null,
    resetKey3 = null
  ) => {
    if (!resetKey1) {
      setSelectedFilters({
        ...selectedFilters,
        [key]: event.target.value,
      });
    } else if (!resetKey2) {
      setSelectedFilters({
        ...selectedFilters,
        [key]: event.target.value,
        [resetKey1]: "",
      });
    } else if (!resetKey3) {
      setSelectedFilters({
        ...selectedFilters,
        [key]: event.target.value,
        [resetKey1]: "",
        [resetKey2]: "",
      });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [key]: event.target.value,
        [resetKey1]: "",
        [resetKey2]: "",
        [resetKey3]: "",
      });
    }
  };

  const handleClick = (key) => {
    setSelectedFilters({
      ...selectedFilters,
      [key]: "",
    });
  };

  const filtersForm = () => {
    return (
      <form
        onClick={(event) => {
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }}
        onSubmit={handleSubmit}
      >
        <h4>Filter by League</h4>
        <div className="selectContainer">
          <select
            ref={selectRef}
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
                <option
                  value={`${league.league}|||${i}`}
                  key={`${league.league}${i}`}
                >
                  {league.league}
                </option>
              );
            })}
          </select>
          {selectedFilters.league ? (
            <MdClear
              className="clearFilterBtn"
              style={{ color: "red" }}
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
                if (globalFilters.date === "all")
                  dispatch(setFilters({ date: new Date() }));
                setOpenFilters(false);
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
            {leagues[selectedLeague].teams.map((team, i) => {
              return (
                <option value={team} key={`${team}${i}`}>
                  {team}
                </option>
              );
            })}
          </select>
          {selectedFilters.team ? (
            <MdClear
              className="clearFilterBtn"
              onClick={() => handleClick("team")}
            />
          ) : null}
        </div>
        <h4>Filter by Home Team</h4>
        <div className="selectContainer">
          <select
            disabled={!selectedFilters.league}
            onChange={(event) =>
              !selectedFilters.awayteam
                ? handleChange(event, "hometeam", "team", "matchday")
                : handleChange(event, "hometeam", "team", "status", "matchday")
            }
            value={selectedFilters.hometeam}
          >
            <option value="" hidden>
              Select Home Team
            </option>
            {leagues[selectedLeague].teams.map((team, i) => {
              return (
                <option value={team} key={`${team}${i}`}>
                  {team}
                </option>
              );
            })}
          </select>
          {selectedFilters.hometeam ? (
            <MdClear
              className="clearFilterBtn"
              onClick={() => handleClick("hometeam")}
            />
          ) : null}
        </div>
        <h4>Filter by Away Team</h4>
        <div className="selectContainer">
          <select
            disabled={!selectedFilters.league}
            onChange={(event) =>
              !selectedFilters.hometeam
                ? handleChange(event, "awayteam", "team", "matchday")
                : handleChange(event, "awayteam", "team", "status", "matchday")
            }
            value={selectedFilters.awayteam}
          >
            <option value="" hidden>
              Select Away Team
            </option>
            {leagues[selectedLeague].teams.map((team, i) => {
              return (
                <option value={team} key={`${team}${i}`}>
                  {team}
                </option>
              );
            })}
          </select>
          {selectedFilters.awayteam ? (
            <MdClear
              className="clearFilterBtn"
              onClick={() => handleClick("awayteam")}
            />
          ) : null}
        </div>
        <h4>Filter by Matchday</h4>
        <div className="sliderContainer">
          <input
            className="slider"
            disabled={
              !selectedFilters.league ||
              selectedFilters.hometeam ||
              selectedFilters.awayteam
            }
            type="range"
            min="1"
            max="38"
            value={selectedFilters.matchday}
            onInput={(event) => handleChange(event, "matchday", "status")}
          ></input>
          {selectedFilters.matchday ? (
            <span id="sliderValue">{selectedFilters.matchday}</span>
          ) : null}
          {selectedFilters.matchday ? (
            <MdClear
              className="clearFilterBtn"
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
          <label htmlFor="scheduled">Scheduled</label>
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
          <label htmlFor="full-time">Full Time</label>
          {selectedFilters.status ? (
            <MdClear
              className="clearFilterBtn"
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
    );
  };

  return leagues ? (
    <div className="filters">
      <BsFilterRight
        id="filtersIcon"
        onClick={() => setOpenFilters(!openFilters)}
      />
      {filtersForm()}
      {createPortal(
        <CSSTransition
          classNames="filtersModal"
          in={openFilters}
          timeout={300}
          mountOnEnter
        >
          <div className="filtersModal" onClick={() => setOpenFilters(false)}>
            {filtersForm()}
          </div>
        </CSSTransition>,
        document.getElementById("root")
      )}
    </div>
  ) : null;
};

export default Filters;
