import "./Tables.scss";
import { useState, useEffect } from "react";
import x_auth from "../config/default";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import getTables from "../redux/actions/table-actions";

const Table = () => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables);
  const [selectedTable, setSelectedTable] = useState(0);
  const [selectedMatches, setSelectedMatches] = useState("total");

  useEffect(() => {
    if (!tables) {
      (async () => {
        const res = await fetch("http://localhost:5000/tables", {
          headers: { "x-auth": x_auth },
        });

        const data = await res.json();

        dispatch(getTables(data));
      })();
    }
  }, [dispatch, tables]);

  return (
    <div className="mainTableContainer">
      {tables ? (
        <form>
          <h4>Filter by League</h4>
          <select
            defaultValue={`${tables[0].country} - ${tables[0].league}`}
            onChange={(event) => {
              setSelectedTable(event.target.value);
              setSelectedMatches("total");
            }}
          >
            {tables.map((table, i) => {
              return (
                <option
                  value={i}
                  key={i}
                >{`${table.country} - ${table.league}`}</option>
              );
            })}
          </select>
          <h4>Filter by Matches</h4>
          <select onChange={(event) => setSelectedMatches(event.target.value)}>
            <option
              value="total"
              selected={selectedMatches === "total" ? true : false}
            >
              All Matches
            </option>
            <option
              value="home"
              selected={selectedMatches === "home" ? true : false}
            >
              Home Matches
            </option>
            <option
              value="away"
              selected={selectedMatches === "away" ? true : false}
            >
              Away Matches
            </option>
          </select>
        </form>
      ) : null}
      {tables ? (
        <SwitchTransition>
          <CSSTransition
            timeout={200}
            key={[selectedTable, selectedMatches]}
            addEndListener={(node, done) =>
              node.addEventListener("transitionend", done, false)
            }
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
                      <td>{row["#"]}</td>
                      <td>
                        <div id="club">
                          <img
                            id="crest"
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
                      <td id="form">
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
      ) : null}
    </div>
  );
};

const NextMatch = ({ row }) => {
  const [openNext, setOpenNext] = useState(false);
  const date = new Date(`${row.next.date} ${row.next.kickOff}`);

  return (
    <div
      onMouseEnter={() => setOpenNext(true)}
      onMouseLeave={() => setOpenNext(false)}
    >
      {row.next.homeCrest === row.crest ? (
        <img
          id="crest"
          src={row.next.awayCrest}
          alt={`${row.team} next Opponent`}
        ></img>
      ) : (
        <img
          id="crest"
          src={row.next.homeCrest}
          alt={`${row.team} next Opponent`}
        ></img>
      )}
      <CSSTransition
        in={openNext}
        mountOnEnter
        unmountOnExit
        timeout={150}
        classNames="matchPopup"
      >
        <div className="nextContainer">
          <div className="nextOpponent">
            <time>
              {date.toDateString() !== "Invalid Date"
                ? date.toDateString()
                : "Date To be Confirmed"}
            </time>
            <div className="nextMatchInfo">
              <div className="nextHome">
                <h4>{row.next.homeTeam}</h4>
                <img
                  src={row.next.homeCrest}
                  alt={`Next Match Home Crest`}
                ></img>
              </div>
              <h4>{row.next.kickOff}</h4>
              <div className="nextAway">
                <img
                  src={row.next.awayCrest}
                  alt={`Next Match Away Crest`}
                ></img>
                <h4>{row.next.awayTeam}</h4>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

const FormMatch = ({ formObj }) => {
  const [openNext, setOpenNext] = useState(false);
  const date = new Date(`${formObj.date} ${formObj.kickOff}`);
  const [styleObj, setStyleObj] = useState({});

  useEffect(() => {
    if (formObj.result === "W") {
      setStyleObj({ background: "green" });
    } else if (formObj.result === "L") {
      setStyleObj({ background: "red" });
    } else {
      setStyleObj({ background: "grey" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <li
      id="result"
      style={styleObj}
      onMouseEnter={() => setOpenNext(true)}
      onMouseLeave={() => setOpenNext(false)}
      onClick={() => window.open(formObj.url)}
    >
      {formObj.result}

      <CSSTransition
        in={openNext}
        mountOnEnter
        unmountOnExit
        timeout={150}
        classNames="matchPopup"
      >
        <div className="formContainer">
          <div className="formOpponent">
            <time>
              {date.toDateString() !== "Invalid Date"
                ? date.toDateString()
                : "Date To be Confirmed"}
            </time>
            <div className="formMatchInfo">
              <div className="formHome">
                <h4>{formObj.homeTeam}</h4>
                <img
                  src={formObj.homeCrest}
                  alt={`Form Match Home Crest`}
                ></img>
              </div>
              <div id="scoreContainer">
                <div id="score">{formObj.homeScore}</div>
                <div id="score">{formObj.awayScore}</div>
              </div>
              <div className="formAway">
                <img
                  src={formObj.awayCrest}
                  alt={`Form Match Away Crest`}
                ></img>
                <h4>{formObj.awayTeam}</h4>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
    </li>
  );
};

export default Table;
