import "./MatchInfo.scss";
import { useEffect, useState, useRef, Fragment } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { x_auth } from "../config/default.js";
import LoadingIcon from "./LoadingIcon";
import { GiSoccerField, GiSoccerBall, GiWhistle } from "react-icons/gi";
import { BiTimeFive } from "react-icons/bi";
import { RiReplyFill } from "react-icons/ri";

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
        `https://serene-everglades-51285.herokuapp.com/api/matches?league=${league}&hometeam=${hometeam}&awayteam=${awayteam}`,
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
          `${jsonData[0].fixtures[0].info.date}T${jsonData[0].fixtures[0].info.kickOff}Z`
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
        current.style.transform = `translateX(-${100 / 3}%)`;
        current.style.WebkitTransform = `translateX(-${100 / 3}%)`;
        current.style.MozTransform = `translateX(-${100 / 3}%)`;
        current.style.height = `${
          current.children[1].getBoundingClientRect().height
        }px`;
      } else {
        current.style.transform = `translateX(-${100 / 1.5}%)`;
        current.style.WebkitTransform = `translateX(-${100 / 1.5}%)`;
        current.style.MozTransform = `translateX(-${100 / 1.5}%)`;
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
        let firstTime = obj1.minute;
        let secondTime = obj2.minute;

        if (firstTime.includes("+")) {
          firstTime = parseInt(firstTime) + parseInt(firstTime.split("+")[1]);
        } else {
          firstTime = parseInt(firstTime);
        }

        if (secondTime.includes("+")) {
          secondTime =
            parseInt(secondTime) + parseInt(secondTime.split("+")[1]);
        } else {
          secondTime = parseInt(secondTime);
        }

        return parseInt(firstTime) - parseInt(secondTime);
      };

      const sortedTimeline = timeline.sort(sortTimeline);

      setTimeline(sortedTimeline);
    }
  }, [fixture]);

  const eventInfo = (event, homeGoals, awayGoals) => {
    let eventElt;
    let playerElt;

    switch (event.event) {
      case "Goal":
        eventElt = <GiSoccerBall />;
        switch (event.team) {
          case "home":
            playerElt = <p>{`${event.player} (${homeGoals}:${awayGoals})`}</p>;
            break;
          case "away":
            playerElt = <p>{`(${homeGoals}:${awayGoals}) ${event.player}`}</p>;
            break;
          default:
            playerElt = <p>{event.player}</p>;
        }
        break;
      case "Own goal":
      /* falls through */
      case "Own Goal":
        eventElt = <GiSoccerBall style={{ color: "#d81920" }} />;
        switch (event.team) {
          case "home":
            playerElt = (
              <p>{`${event.player}, Own goal (${homeGoals}:${awayGoals})`}</p>
            );
            break;
          case "away":
            playerElt = (
              <p>{`(${homeGoals}:${awayGoals}) Own goal, ${event.player}`}</p>
            );
            break;
          default:
            playerElt = <p>{event.player}</p>;
        }
        break;
      case "Yellow card":
      /* falls through */
      case "Yellow Card":
        eventElt = <div className="yellowCard"></div>;
        playerElt = <p>{event.player}</p>;
        break;
      case "Red card":
      /* falls through */
      case "Red Card":
        eventElt = <div className="redCard"></div>;
        playerElt = <p>{event.player}</p>;
        break;
      case "Second yellow card":
      /* falls through */
      case "Second Yellow Card (Red Card)":
        eventElt = (
          <div className="secondYellow">
            <div className="yellowCard"></div>
            <div className="redCard"></div>
          </div>
        );
        playerElt = <p>{event.player}</p>;
        break;
      case "Penalty scored":
        eventElt = <GiSoccerBall style={{ color: "#13cf00" }} />;
        switch (event.team) {
          case "home":
            playerElt = (
              <p>{`${event.player}, Penalty (${homeGoals}:${awayGoals})`}</p>
            );
            break;
          case "away":
            playerElt = (
              <p>{`(${homeGoals}:${awayGoals}) Penalty, ${event.player}`}</p>
            );
            break;
          default:
            playerElt = <p>{event.player}</p>;
        }
        break;
      default:
        eventElt = <p>{event.event}</p>;
        playerElt = <p>{event.player}</p>;
    }

    return (
      <div className="eventInfo">
        {event.event !== "Substitution" ? (
          <Fragment>
            {event.team === "away" ? eventElt : null}
            {playerElt}
            {event.team === "home" ? eventElt : null}
          </Fragment>
        ) : event.team === "away" ? (
          <Fragment>
            <RiReplyFill />
            <p>{event.playerIn}</p>
            <RiReplyFill className="subOut" />
            <p>{event.playerOff}</p>
            <p>{event.playerOut}</p>
          </Fragment>
        ) : (
          <Fragment>
            <p>{event.playerOff}</p>
            <p>{event.playerOut}</p>
            <RiReplyFill className="subOut" />
            <p>{event.playerIn}</p>
            <RiReplyFill className="subIn" />
          </Fragment>
        )}
      </div>
    );
  };

  return fixture ? (
    <div className="matchContainer">
      <div className="matchInfo">
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
          <div className="scorersContainer">
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
        <div className="info">
          <div className="date">
            {date ? (
              <time>
                {date.getHours()}:{date.getMinutes()}
              </time>
            ) : null}
            <BiTimeFive />
            {date ? format(date, "iii, LLL do") : null}
          </div>
          <div className="referee">
            <GiWhistle /> {fixture.info.referee}
          </div>
          <div className="stadium">
            <GiSoccerField style={{ transform: "rotate(90deg)" }} />
            {fixture.info.stadium}
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
                    let homeGoals = fixture.result.home.score;
                    let awayGoals = fixture.result.away.score;

                    for (let i = timeline.length - 1; i >= 0; i--) {
                      if (timeline[i].event)
                        elts.push(
                          <li key={i}>
                            <div className="homeEvent">
                              {timeline[i].team === "home"
                                ? eventInfo(timeline[i], homeGoals, awayGoals)
                                : null}
                            </div>
                            <div className="eventTime">
                              {timeline[i].minute}
                            </div>
                            <div className="awayEvent">
                              {timeline[i].team === "away"
                                ? eventInfo(timeline[i], homeGoals, awayGoals)
                                : null}
                            </div>
                          </li>
                        );

                      if (timeline[i].event) {
                        if (
                          timeline[i].event.includes("Goal") ||
                          timeline[i].event.includes("goal") ||
                          timeline[i].event.includes("Penalty scored")
                        ) {
                          if (timeline[i].team === "home") {
                            homeGoals--;
                          } else {
                            awayGoals--;
                          }
                        }
                      }
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
                  <span className="firstStatNum">
                    {fixture.stats[stat].home}
                  </span>
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
                  <span className="secondStatNum">
                    {fixture.stats[stat].away}
                  </span>
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
