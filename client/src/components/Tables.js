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

  const createFormDiv = (formObj, i) => {
    const styleObj = {};

    if (formObj.result === "W") {
      styleObj.background = "green";
    } else if (formObj.result === "L") {
      styleObj.background = "red";
    } else {
      styleObj.background = "grey";
    }

    return (
      <li id="result" style={styleObj} key={i}>
        {formObj.result}
      </li>
    );
  };

  return (
    <div className="mainTableContainer">
      <form>
        <h4>Filter by League</h4>
        <select
          onChange={(event) => {
            setSelectedTable(event.target.value);
            setSelectedMatches("total");
          }}
        >
          {tables
            ? tables.map((table, i) => {
                return (
                  <option
                    selected={i === selectedTable ? true : false}
                    value={i}
                  >{`${table.country} - ${table.league}`}</option>
                );
              })
            : null}
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
      {tables ? (
        <SwitchTransition>
          <CSSTransition
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
                          {row.form.map((fix, i) => createFormDiv(fix, i))}
                        </ul>
                      </td>
                      <td>
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

export default Table;
