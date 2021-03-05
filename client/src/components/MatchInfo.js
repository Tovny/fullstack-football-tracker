import "./MatchInfo.scss";
import { useEffect, useState, useRef, Fragment } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import x_auth from "../config/default";
import LoadingIcon from "./LoadingIcon";
import ScheduleIcon from "@material-ui/icons/Schedule";
import SportsIcon from "@material-ui/icons/Sports";
import stadium from "../assets/stadium.png";
import SportsSoccerIcon from "@material-ui/icons/SportsSoccer";
import ReplyIcon from "@material-ui/icons/Reply";

const MatchInfo = () => {
  const { league, hometeam, awayteam } = useParams();
  const [fixture, setFixture] = useState(null);
  const [date, setDate] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await fetch(
        `http://localhost:5000/matches?league=${league}&hometeam=${hometeam}&awayteam=${awayteam}`,
        {
          method: "GET",
          headers: {
            "x-auth": x_auth,
          },
        }
      );
      const jsonData = await data.json();
      setFixture(jsonData[0].fixtures[0]);
      setDate(
        new Date(
          `${jsonData[0].fixtures[0].info.date} ${jsonData[0].fixtures[0].info.kickOff}`
        )
      );
      setSelectedTab("events");
    })();
  }, [league, hometeam, awayteam]);

  useEffect(() => {
    const current = tabsRef.current;

    if (current) {
      if (selectedTab === "events") {
        current.style.transform = "translateX(0)";
        current.style.WebkitTransform = "translateX(0)";
        current.style.MozTransform = "translateX(0)";
        current.style.height = `${
          current.children[0].getBoundingClientRect().height
        }px`;
      } else if (selectedTab === "lineups") {
        current.style.transform = "translateX(-33.333%)";
        current.style.WebkitTransform = "translateX(-33.333%)";
        current.style.MozTransform = "translateX(-33.333%)";
        current.style.height = `${
          current.children[1].getBoundingClientRect().height
        }px`;
      } else {
        current.style.transform = "translateX(-66.666%)";
        current.style.WebkitTransform = "translateX(-66.666%)";
        current.style.MozTransform = "translateX(-66.666%)";
        current.style.height = `${
          current.children[2].getBoundingClientRect().height
        }px`;
      }
    }
  }, [selectedTab]);

  useEffect(() => {
    if (fixture) {
      const home = fixture.timeline.home.map((event) => {
        return { ...event, team: "home" };
      });

      const away = fixture.timeline.away.map((event) => {
        return { ...event, team: "away" };
      });

      const timeline = home.concat(away);
      const sortTimeline = (obj1, obj2) => {
        return parseInt(obj1.minute) - parseInt(obj2.minute);
      };

      const sortedTimeline = timeline.sort(sortTimeline);

      setTimeline(sortedTimeline);
    }
  }, [fixture]);

  const eventInfo = (event) => {
    let eventElt;

    switch (event.event) {
      case "Goal":
        eventElt = <SportsSoccerIcon />;
        break;
      case "Own goal":
        eventElt = <SportsSoccerIcon style={{ color: "#d81920" }} />;
        break;
      case "Yellow card":
        eventElt = <div className="yellowCard"></div>;
        break;
      case "Yellow Card":
        eventElt = <div className="yellowCard"></div>;
        break;
      case "Red card":
        eventElt = <div className="redCard"></div>;
        break;
      case "Red Card":
        eventElt = <div className="redCard"></div>;
        break;
      case "Second yellow card":
        eventElt = (
          <div className="secondYellow">
            <div className="yellowCard"></div>
            <div className="redCard"></div>
          </div>
        );
        break;
      case "Second Yellow Card (Red Card)":
        eventElt = (
          <div className="secondYellow">
            <div className="yellowCard"></div>
            <div className="redCard"></div>
          </div>
        );
        break;
      case "Penalty scored":
        eventElt = <SportsSoccerIcon style={{ color: "#13cf00" }} />;
        break;
      default:
        eventElt = <p>{event.event}</p>;
    }

    return (
      <div className="eventInfo">
        {event.event !== "Substitution" ? (
          <Fragment>
            {event.team === "away" ? eventElt : null}
            <p>{event.player}</p>
            {event.team === "home" ? eventElt : null}
          </Fragment>
        ) : event.team === "away" ? (
          <Fragment>
            <ReplyIcon />
            <p>{event.playerIn}</p>
            <ReplyIcon className="subOut" />
            <p>{event.playerOff}</p>
            <p>{event.playerOut}</p>
          </Fragment>
        ) : (
          <Fragment>
            <p>{event.playerOff}</p>
            <p>{event.playerOut}</p>
            <ReplyIcon className="subOut" />
            <p>{event.playerIn}</p>
            <ReplyIcon className="subIn" />
          </Fragment>
        )}
      </div>
    );
  };

  return fixture ? (
    <div className="matchContainer">
      <div className="matchInfo">
        <div className="info">
          <div className="date">
            <ScheduleIcon />
            {date ? format(date, "iii, LLL do") : null}, Matchday{" "}
            {fixture.info.matchday}
            <span>{fixture.info.kickOff}</span>
          </div>
          <div className="referee">
            <SportsIcon /> {fixture.info.referee}
          </div>
          <div className="stadium">
            <img src={stadium} alt="stadium"></img>
            {fixture.info.stadium}
          </div>
        </div>
        <div className="scoreContainer">
          <div className="teamName" id="homeTeam">
            <h3>{fixture.teams.home.name}</h3>
            <div></div>
          </div>
          <div className="crestContainer">
            <img alt="Home Team Crest" src={fixture.teams.home.crest}></img>
          </div>
          <div className="score">
            <span>{fixture.result.home.score}</span> -{" "}
            <span>{fixture.result.away.score}</span>
          </div>
          <div className="crestContainer">
            <img alt="Home Team Crest" src={fixture.teams.away.crest}></img>
          </div>
          <div className="teamName" id="awayTeam">
            <h3>{fixture.teams.away.name}</h3>
            <div></div>
          </div>
          <div className="scorers" id="homeScorers">
            {fixture.result.home.scorers.map((scorer, i) => {
              return <p key={`Scorer Home ${i}`}>{scorer}</p>;
            })}
          </div>
          <div className="matchStatus">
            <h2>{fixture.info.status}</h2>
          </div>
          <div className="scorers" id="awayScorers">
            {fixture.result.away.scorers.map((scorer, i) => {
              return <p key={`Scorer Away ${i}`}>{scorer}</p>;
            })}
          </div>
        </div>
      </div>
      <div className="tabs">
        <span
          id={selectedTab === "events" ? "selectedTab" : null}
          onClick={() => setSelectedTab("events")}
        >
          Match Events
        </span>
        <span
          id={selectedTab === "lineups" ? "selectedTab" : null}
          onClick={() => setSelectedTab("lineups")}
        >
          Lineups
        </span>
        <span
          id={selectedTab === "stats" ? "selectedTab" : null}
          onClick={() => setSelectedTab("stats")}
        >
          Statistics
        </span>
      </div>
      <div className="tabsContainer">
        <div className="tabsInfo" ref={tabsRef}>
          <div className="matchEvents">
            <ul>
              {timeline
                ? (() => {
                    const elts = [];
                    for (let i = timeline.length - 1; i >= 0; i--) {
                      elts.push(
                        <li key={i}>
                          <div className="homeEvent">
                            {timeline[i].team === "home"
                              ? eventInfo(timeline[i])
                              : null}
                          </div>
                          <div className="eventTime">{timeline[i].minute}</div>
                          <div className="awayEvent">
                            {timeline[i].team === "away"
                              ? eventInfo(timeline[i])
                              : null}
                          </div>
                        </li>
                      );
                    }
                    return elts;
                  })()
                : null}
            </ul>
          </div>
          <div className="lineups">
            <div className="lineupsContainer">
              <h3>Starters</h3>
              <div className="homeStarters">
                <ul>
                  {fixture.squads.home.starters.map((starter, i) => {
                    return (
                      <li key={`Starter Home ${i}`}>
                        <span>{starter[1]}</span> <span>{starter[0]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="awayStarters">
                <ul>
                  {fixture.squads.away.starters.map((starter, i) => {
                    return (
                      <li key={`Starter Away ${i}`}>
                        <span>{starter[0]}</span> <span>{starter[1]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <h3>Reserves</h3>
              <div className="homeReserves">
                <ul>
                  {fixture.squads.home.reserves.map((reserve, i) => {
                    return (
                      <li key={`Reserve Home ${i}`}>
                        <span>{reserve[1]}</span> <span>{reserve[0]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="awayReserves">
                <ul>
                  {fixture.squads.away.reserves.map((reserve, i) => {
                    return (
                      <li key={`Reserve ${i}`}>
                        <span>{reserve[0]}</span> <span>{reserve[1]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="statistics">
            {Object.keys(fixture.stats).map((stat, i) => (
              <div className="statistic" key={`Stat ${i}`}>
                <h4>{stat}</h4>
                <div className="stat">
                  <span>{fixture.stats[stat].home}</span>
                  <div
                    className="statBar"
                    style={
                      fixture.stats[stat].home === 0 &&
                      fixture.stats[stat].away === 0
                        ? { gridTemplateColumns: "1fr 1fr" }
                        : {
                            gridTemplateColumns: `${
                              (fixture.stats[stat].home * 100) /
                              (fixture.stats[stat].home +
                                fixture.stats[stat].away)
                            }% 1fr`,
                          }
                    }
                  >
                    <div className="homeStat"></div>
                    <div className="awayStat"></div>
                  </div>
                  <span>{fixture.stats[stat].away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <LoadingIcon />
  );
};

export default MatchInfo;
