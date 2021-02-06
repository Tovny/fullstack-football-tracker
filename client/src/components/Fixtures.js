import "./Fixtures.scss";
import { useState, useEffect, useRef } from "react";
import x_auth from "../config/default";
import DateCarousel from "./DateCarousel";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import setFixtures from "../redux/actions/fixture-actions";
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

  useEffect(() => {
    (async () => {
      let dateString;
      date === "all" || !date
        ? (dateString = "all")
        : (dateString = date.toISOString().split("T")[0]);

      let filterString = "?";

      if (dateString === "all") {
        setDirection("fixturesTransitionOpacity");
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
  }, [date, league, team, hometeam, awayteam, matchday, status, dispatch]);

  useEffect(() => {
    if (fixtures) {
      const temp = [];
      fixtures.forEach((league) => {
        temp.push(
          <LeagueFixtures league={league} date={date} key={league.league} />
        );
      });
      setFixtureElements(temp);
      setCauseRerender(!causeRerender);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtures]);

  return (
    <div className="fixturesContainer">
      <DateCarousel setDirection={setDirection} />
      {fixtures ? (
        <SwitchTransition>
          <CSSTransition
            key={causeRerender}
            addEndListener={(node, done) =>
              node.addEventListener("transitionend", done, false)
            }
            classNames={direction}
            mountOnEnter
            unmountOnExit
          >
            <div className="fixtures">
              {fixtureElements ? (
                fixtureElements.length > 0 ? (
                  fixtureElements
                ) : (
                  <div className="noFixtures">
                    <img src={stadium} alt="stadium"></img>
                    <h3>No scheduled fixtures</h3>
                  </div>
                )
              ) : null}
            </div>
          </CSSTransition>
        </SwitchTransition>
      ) : (
        <div className="loadingIcon"></div>
      )}
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
          {props.league.fixtures.map((match, i) => {
            const date = new Date(`${match.info.date}T${match.info.kickOff}Z`);

            return (
              <div
                key={i}
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

                {props.date === "all" ? (
                  <div id="date">
                    {date.toDateString() !== "Invalid Date"
                      ? format(date, "iii, LLL do, yyyy")
                      : "Date To Be Confirmed"}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CSSTransition>
    </div>
  ) : null;
};

export default Fixtures;
