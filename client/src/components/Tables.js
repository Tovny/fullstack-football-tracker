import "./Tables.scss";
import { useState, useEffect, useRef, Fragment } from "react";
import { useParams } from "react-router-dom";
import { x_auth, PORT } from "../config";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import getTables from "../redux/actions/table-actions";
import { format } from "date-fns";
import LoadingIcon from "./LoadingIcon";
import { RiArrowDropDownLine } from "react-icons/ri";

const Table = () => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables);
  const { table } = useParams();
  const [selectedTable, setSelectedTable] = useState(
    table ? parseInt(table) : 0
  );
  const [selectedMatches, setSelectedMatches] = useState("total");
  const [openLeagueSelect, setOpenLeagueSelect] = useState(false);
  const [openMatchSelect, setOpenMatchSelect] = useState(false);

  useEffect(() => {
    if (!tables) {
      (async () => {
        const res = await fetch(`http://localhost:${PORT}/api/tables`, {
          headers: { "x-auth": x_auth },
        });

        const data = await res.json();

        dispatch(getTables(data));
      })();
    }
  }, [dispatch, tables]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setOpenLeagueSelect(false);
      setOpenMatchSelect(false);
    });
  }, []);

  return (
    <div className="mainTableContainer">
      {tables ? (
        <Fragment>
          <div className="tableFilters">
            <div className="selectTable">
              <div id="imgContainer">
                <img src={tables[selectedTable].logo} alt="leagueLogo"></img>
              </div>
              <h3>
                {`${tables[selectedTable].country} - 
                ${tables[selectedTable].league}`}
              </h3>
              <RiArrowDropDownLine
                onClick={(event) => {
                  setOpenLeagueSelect(!openLeagueSelect);
                  setOpenMatchSelect(false);
                  event.stopPropagation();
                  event.nativeEvent.stopImmediatePropagation();
                }}
              />

              <CSSTransition
                in={openLeagueSelect}
                mountOnEnter
                unmountOnExit
                timeout={250}
                classNames="tableTransition"
              >
                <div className="selectors">
                  {tables.map((table, i) => {
                    return (
                      <h4
                        className="leagueSelect"
                        onClick={() => {
                          setSelectedTable(i);
                          setSelectedMatches("total");
                          setOpenLeagueSelect(false);
                        }}
                        key={i}
                      >
                        {`${table.country} - ${table.league}`}
                      </h4>
                    );
                  })}
                </div>
              </CSSTransition>
            </div>
            <div className="selectMatch">
              <RiArrowDropDownLine
                onClick={(event) => {
                  setOpenMatchSelect(!openMatchSelect);
                  setOpenLeagueSelect(false);
                  event.stopPropagation();
                  event.nativeEvent.stopImmediatePropagation();
                }}
              />
              <h3>
                {selectedMatches === "total"
                  ? "All Matches"
                  : selectedMatches === "home"
                  ? "Home Matches"
                  : "Away Matches"}
              </h3>
              <CSSTransition
                in={openMatchSelect}
                mountOnEnter
                unmountOnExit
                timeout={250}
                classNames="tableTransition"
              >
                <div className="selectors" id="matchesSelector">
                  <h4
                    className="leagueSelect"
                    onClick={() => {
                      setSelectedMatches("total");
                      setOpenMatchSelect(false);
                    }}
                  >
                    All Matches
                  </h4>
                  <h4
                    className="leagueSelect"
                    onClick={() => {
                      setSelectedMatches("home");
                      setOpenMatchSelect(false);
                    }}
                  >
                    Home Matches
                  </h4>
                  <h4
                    className="leagueSelect"
                    onClick={() => {
                      setSelectedMatches("away");
                      setOpenMatchSelect(false);
                    }}
                  >
                    Away Matches
                  </h4>
                </div>
              </CSSTransition>
            </div>
          </div>
          <SwitchTransition>
            <CSSTransition
              timeout={200}
              unmountOnExit
              key={[selectedTable, selectedMatches]}
              classNames="tableTransition"
            >
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Club</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Drawn</th>
                    <th>Lost</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Points</th>
                    <th>Form</th>
                    <th>Next</th>
                  </tr>
                </thead>
                <tbody>
                  {tables[selectedTable].tables[selectedMatches].map((row) => {
                    return (
                      <tr key={row["#"]}>
                        <td
                          style={
                            row.status === "Relegation"
                              ? {
                                  boxShadow: "inset 5px 0px 0px 0px #d81920",
                                }
                              : row.status === "Champions League"
                              ? {
                                  boxShadow: "inset 5px 0px 0px 0px #13cf00",
                                }
                              : row.status === "Europa League"
                              ? {
                                  boxShadow: "inset 5px 0px 0px 0px #AA9944",
                                }
                              : null
                          }
                        >
                          {row["#"]}
                        </td>
                        <td>
                          <div className="club">
                            <img
                              className="crest"
                              src={row.crest}
                              alt={`${row.team} Crest`}
                            ></img>
                            <h3>{row.team}</h3>
                          </div>
                        </td>
                        <td>{row.played}</td>
                        <td>{row.won}</td>
                        <td>{row.drawn}</td>
                        <td>{row.lost}</td>
                        <td>{row.gf}</td>
                        <td>{row.ga}</td>
                        <td>{row.gd}</td>
                        <td>{row.points}</td>
                        <td className="form">
                          <ul>
                            {row.form.map((fix, i) => (
                              <FormMatch formObj={fix} key={i} />
                            ))}
                          </ul>
                        </td>
                        <td className="next">
                          <NextMatch row={row} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CSSTransition>
          </SwitchTransition>
          <div id="tableLegend">
            <div id="championsLeague">Champions League</div>
            <div id="europaLeague">Europa League</div>
            <div id="relegation">Relegation</div>
          </div>
        </Fragment>
      ) : (
        <LoadingIcon />
      )}
    </div>
  );
};

const NextMatch = ({ row }) => {
  const nextRef = useRef(null);
  const date = new Date(`${row.next.date} ${row.next.kickOff}`);

  return (
    <div
      onMouseEnter={() => (nextRef.current.style.display = "block")}
      onMouseLeave={() => (nextRef.current.style.display = "none")}
    >
      {row.next.homeCrest === row.crest ? (
        <img
          className="crest"
          src={row.next.awayCrest}
          alt={`${row.team} next Opponent`}
        ></img>
      ) : (
        <img
          className="crest"
          src={row.next.homeCrest}
          alt={`${row.team} next Opponent`}
        ></img>
      )}
      <div className="nextContainer" ref={nextRef}>
        <div className="nextOpponent">
          <time>
            {date.toDateString() !== "Invalid Date"
              ? format(date, "iiii, LLL do")
              : "Date To be Confirmed"}
          </time>
          <div className="nextMatchInfo">
            <div className="nextHome">
              <h4>{row.next.homeTeam}</h4>
              <img src={row.next.homeCrest} alt={`Next Match Home Crest`}></img>
            </div>
            <h4>{row.next.kickOff}</h4>
            <div className="nextAway">
              <img src={row.next.awayCrest} alt={`Next Match Away Crest`}></img>
              <h4>{row.next.awayTeam}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormMatch = ({ formObj }) => {
  const formRef = useRef(null);
  const date = new Date(`${formObj.date} ${formObj.kickOff}`);
  const [styleObj, setStyleObj] = useState({});

  useEffect(() => {
    if (formObj.result === "W") {
      setStyleObj({ background: "#13cf00" });
    } else if (formObj.result === "L") {
      setStyleObj({ background: "#d81920" });
    } else {
      setStyleObj({ background: "#76766f" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <li
      className="result"
      style={styleObj}
      onMouseEnter={() => (formRef.current.style.display = "block")}
      onMouseLeave={() => (formRef.current.style.display = "none")}
    >
      {formObj.result}
      <a className="formContainer" href={formObj.url} ref={formRef}>
        <div className="formOpponent">
          <time>
            {date.toDateString() !== "Invalid Date"
              ? format(date, "iiii, LLL do")
              : "Date To be Confirmed"}
          </time>
          <div className="formMatchInfo">
            <div className="formHome">
              <h4>{formObj.homeTeam}</h4>
              <img src={formObj.homeCrest} alt={`Form Match Home Crest`}></img>
            </div>
            <div className="scoreContainer">
              <div className="score">{formObj.homeScore}</div>
              <div className="score">{formObj.awayScore}</div>
            </div>
            <div className="formAway">
              <img src={formObj.awayCrest} alt={`Form Match Away Crest`}></img>
              <h4>{formObj.awayTeam}</h4>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

export default Table;
