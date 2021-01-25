import { useState, useEffect } from "react";
import x_auth from "../config/default";

const Table = () => {
  const [table, setTable] = useState();

  useEffect(() => {
    (async () => {
      const res = await fetch(
        "http://localhost:5000/tables?league=premier-league",
        {
          headers: { "x-auth": x_auth },
        }
      );

      setTable(await res.json());
    })();
  }, []);

  const createFormDiv = (formObj) => {
    const styleObj = new Object();

    if (formObj.result == "W") {
      styleObj.background = "green";
    } else if (formObj.result == "L") {
      styleObj.background = "red";
    } else {
      styleObj.background = "grey";
    }

    return (
      <div id="result" style={styleObj}>
        <div id="formText">{formObj.result}</div>
      </div>
    );
  };

  return (
    <div>
      {table ? (
        <table>
          {
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
          }
          <tbody>
            {table[0].tables.total.map((row, i) => {
              return (
                <tr key={row["#"]}>
                  <td>{row["#"]}</td>
                  <td id="club">
                    <img id="crest" src={row.crest}></img>
                    <h3>{row.team}</h3>
                  </td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td>{row.gd}</td>
                  <td>{row.points}</td>
                  <td id="form">{row.form.map((fix) => createFormDiv(fix))}</td>
                  <td>
                    {row.next.homeCrest == row.crest ? (
                      <img id="crest" src={row.next.awayCrest}></img>
                    ) : (
                      <img id="crest" src={row.next.homeCrest}></img>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <h3>Loading table</h3>
      )}
    </div>
  );
};

export default Table;

/*
<tbody>
            {table[1].tables.total.map((row, i) => {
              return (
                <tr>
                  {Object.keys(row).map((key) => {
                    return (
                      <td>
                        {key === "crest" ? (
                          <img id="crest" src={row[key]}></img>
                        ) : (
                          row[key]
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          */
