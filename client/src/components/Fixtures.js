import "./Fixtures.scss";
import { useState, useEffect, useRef } from "react";
import x_auth from "../config/default";
import DateCarousel from "./DateCarousel";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import setFixtures from "../redux/actions/fixture-actions";
import { setFilters } from "../redux/actions/filter-actions";
import { format } from "date-fns";
import stadium from "../assets/stadium.png";

const Fixtures = () => {
  const dispatch = useDispatch();
  const fixtures = useSelector((state) => state.fixtures);
  const {
    date,
    league,
    team,
    hometeam,
    awayteam,
    matchday,
    status,
  } = useSelector((state) => state.filters);
  const [direction, setDirection] = useState("fixturesTransitionOpacity");
  const [fixtureElements, setFixtureElements] = useState(null);
  const [causeRerender, setCauseRerender] = useState(false);
  const [xPos, setXPos] = useState(0);
  const selectedDate = document.getElementById("selectedDate");
  const fixturesContainer = useRef(null);

  useEffect(() => {
    (async () => {
      let dateString;
      date === "all" || !date
        ? (dateString = "all")
        : (dateString = date.toISOString().split("T")[0]);

      let filterString = "?";

      if (dateString === "all") {
        setDirection("fixturesTransitionOpacity");
        setFixtureElements(null);
        setCauseRerender(!causeRerender);
      }

      if (dateString) filterString = filterString + `&date=${dateString}`;
      if (league) filterString = filterString + `&league=${league}`;
      if (team) filterString = filterString + `&team=${team}`;
      if (hometeam) filterString = filterString + `&hometeam=${hometeam}`;
      if (awayteam) filterString = filterString + `&awayteam=${awayteam}`;
      if (matchday) filterString = filterString + `&matchday=${matchday}`;
      if (status) filterString = filterString + `&status=${status}`;

      const res = await fetch(`http://localhost:5000/matches?${filterString}`, {
        method: "GET",
        headers: {
          "x-auth": x_auth,
        },
      });
      const data = await res.json();
      dispatch(setFixtures(data));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, league, team, hometeam, awayteam, matchday, status]);

  useEffect(() => {
    if (fixtures) {
      const temp = [];

      fixtures.forEach((league) => {
        temp.push(
          <LeagueFixtures league={league} date={date} key={league.league} />
        );
      });
      if (temp.length === 0)
        temp.push(
          <div className="noFixtures" key="noFix">
            <img src={stadium} alt="stadium"></img>
            <h3>No scheduled fixtures</h3>
          </div>
        );
      setFixtureElements(temp);
      setXPos(0);
      setDirection("fixturesTransitionOpacity");
      setCauseRerender(!causeRerender);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtures]);

  useEffect(() => {
    if (document.getElementById("selectedDate"))
      document.getElementById("selectedDate").scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
  }, [selectedDate]);

  const handleTouchMove = (event) => {
    let scrollPos = event.touches[0].clientY;

    const element = event.target;

    element.ontouchmove = (event) => {
      let secondY = event.touches[0].clientY;

      if (secondY > scrollPos - 2 && secondY < scrollPos + 2) {
        element.onTouchStart = onTouchPreventScroll(event);
      } else {
        element.ontouchmove = null;
      }
    };

    const onTouchPreventScroll = (event) => {
      let firstPos = event.touches[0].clientX;
      let secondPos = 0;
      let finalPos;

      let element = event.target;

      element.ontouchmove = (event) => {
        secondPos = event.touches[0].clientX;
        finalPos = xPos + secondPos - firstPos;
        setXPos(finalPos);
      };

      element.ontouchend = () => {
        element.ontouchmove = null;
        element.ontouchend = null;

        let eltRect;
        if (fixturesContainer.current)
          eltRect = fixturesContainer.current.getBoundingClientRect();

        if (finalPos === 0 || !finalPos) {
          return;
        } else {
          setDirection("fixturesTransitionOpacity");
          if (finalPos < 0) {
            if (-eltRect.width / 2 < finalPos) {
              setXPos(0);
            } else {
              setXPos(-eltRect.width || -750);
              let newFixDate;
              if (date !== "all") {
                newFixDate = new Date(date);
                newFixDate.setDate(newFixDate.getDate() + 1);
              } else {
                newFixDate = new Date();
              }

              dispatch(setFilters({ date: newFixDate }));
            }
          } else {
            if (eltRect.width / 2 > finalPos) {
              setXPos(0);
            } else {
              setXPos(eltRect.width || 750);
              let newFixDate;
              if (date !== "all") {
                newFixDate = new Date(date);
                newFixDate.setDate(newFixDate.getDate() - 1);
              } else {
                newFixDate = new Date();
              }

              dispatch(setFilters({ date: newFixDate }));
            }
          }
        }

        element.onTouchStart = handleTouchMove;
      };
    };
  };

  return (
    <div className="fixturesContainer">
      <DateCarousel setDirection={setDirection} />
      <SwitchTransition>
        <CSSTransition
          key={causeRerender}
          addEndListener={(node, done) =>
            node.addEventListener("transitionend", done, false)
          }
          classNames={direction}
          mountOnEnter
          unmountOnExit
          style={{ left: xPos }}
        >
          <div className="fixtures" onTouchStart={handleTouchMove}>
            {fixtureElements ? (
              <div id="loadingIconLeft">
                <div className="loadingIcon"></div>
              </div>
            ) : null}
            <div className="leagueFixturesContainer" ref={fixturesContainer}>
              {fixtureElements ? (
                fixtureElements
              ) : (
                <div className="loadingIcon"></div>
              )}
            </div>
            {fixtureElements ? (
              <div id="loadingIconRight">
                <div className="loadingIcon"></div>
              </div>
            ) : null}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

const LeagueFixtures = (props) => {
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState();
  const heightRef = useRef(null);

  useEffect(() => {
    const currentElt = heightRef.current;
    if (props.date !== "all" && currentElt)
      setHeight(currentElt.getBoundingClientRect().height);
  }, [props.league.fixtures, props.date]);

  const addHeight = (elt) => {
    setHeight(height + elt.getBoundingClientRect().height);
  };

  const detractHeight = (elt) => {
    setHeight(height - elt.getBoundingClientRect().height);
  };

  const fixtureBody = (match, i = null) => {
    const date = new Date(`${match.info.date}T${match.info.kickOff}Z`);

    return (
      <div
        key={i ? i : null}
        className="fixtureBody"
        onClick={
          match.info.status !== "Scheduled"
            ? () => window.open(match.info.url)
            : null
        }
      >
        <div id="home">
          {match.teams.home.shortName
            ? match.teams.home.shortName
            : match.teams.home.name}
          <span>
            <img
              id="crest"
              src={match.teams.home.crest}
              alt={`${match.teams.home.name} logo`}
            ></img>
          </span>
        </div>

        {typeof match.result.home.score == "number" ? (
          <div id="scoreContainer">
            <div id="score">{match.result.home.score}</div>
            <div id="score">{match.result.away.score}</div>
          </div>
        ) : (
          <div id="kickOff">
            {date.toString() !== "Invalid Date"
              ? `${date.getHours()}:${
                  date.getMinutes() === 0 ? "00" : date.getMinutes()
                }`
              : "TBC"}
          </div>
        )}

        <div id="away">
          <span>
            <img
              id="crest"
              src={match.teams.away.crest}
              alt={`${match.teams.away.crest} logo`}
            ></img>
          </span>
          {match.teams.away.shortName
            ? match.teams.away.shortName
            : match.teams.away.name}
        </div>
      </div>
    );
  };

  const createFixtures = (arr) => {
    const fixturesElts = [];
    let i = 0;

    const innerLoop = () => {
      const innerFixElts = [];
      const currentDate = arr[i].info.date;
      for (i; i <= arr.length - 1; i++) {
        let fixtureDate = arr[i].info.date;
        if (fixtureDate !== currentDate) {
          break;
        } else {
          innerFixElts.push(
            <li key={`li${i}`}>{fixtureBody(arr[i], props.date)}</li>
          );
        }
      }
      return innerFixElts;
    };

    if (props.date === "all") {
      for (i; i <= arr.length - 1; i) {
        const fixDate = new Date(`${arr[i].info.date}T${arr[i].info.kickOff}Z`);
        fixturesElts.push(
          <ul key={`ul${i}`}>
            <li>
              <div className="fixturesDate">
                {fixDate.toDateString() !== "Invalid Date"
                  ? format(fixDate, "iii, LLL do, yyyy")
                  : "Date To Be Confirmed"}
              </div>
            </li>
            {innerLoop()}
          </ul>
        );
      }
      return fixturesElts;
    } else {
      const dailyFixtures = <ul>{innerLoop()}</ul>;
      return dailyFixtures;
    }
  };

  return props.league ? (
    <div className="leagueFixtures" ref={heightRef} style={{ height: height }}>
      <div className="fixturesHeading">
        <div className="leagueLogoContainer">
          <img
            id="leagueLogo"
            src={props.league.logo}
            alt={`${props.league.league} logo`}
          ></img>
        </div>
        <h3>
          {props.league.country} - {props.league.league}
        </h3>
        <ArrowDropDownIcon
          onClick={() => setOpen(!open)}
          style={
            open
              ? {
                  position: "absolute",
                  right: "1rem",
                  transform: "rotateX(180deg)",
                  transition: "transform 250ms ease-in",
                  cursor: "pointer",
                }
              : {
                  position: "absolute",
                  right: "1rem",
                  transition: "transform 250ms ease-in",
                  cursor: "pointer",
                }
          }
        />
      </div>
      <CSSTransition
        in={open}
        timeout={250}
        classNames="innerFixturesTransition"
        unmountOnExit
        mountOnEnter
        onExit={detractHeight}
        onEnter={addHeight}
      >
        <div className="fixtureBodies">
          {createFixtures(props.league.fixtures)}
        </div>
      </CSSTransition>
    </div>
  ) : null;
};

export default Fixtures;
