import "./App.css";

import { useState, useEffect } from "react";
import fetch from "node-fetch";

function App() {
  const [articles, setArticles] = useState();
  const [table, setTable] = useState();
  const [matches, setMatches] = useState();
  const [multi, setMulti] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/articles", {
        method: "GET",
        headers: {
          "x-auth": "98e10fb6ca9419a8894108337d3cb61d",
        },
      });
      setArticles(await res.json());

      const tableRes = await fetch("http://localhost:5000/tables", {
        headers: { "x-auth": "98e10fb6ca9419a8894108337d3cb61d" },
      });

      setTable(await tableRes.json());

      /*const matchRes = await fetch("http://localhost:5000/matches", {
        method: "GET",
        headers: {
          day: multi,
        },
      });
      setMatches(await matchRes.json());*/
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const matchRes = await fetch("http://localhost:5000/matches", {
        method: "GET",
        headers: {
          day: multi,
          "x-auth": "98e10fb6ca9419a8894108337d3cb61d",
        },
      });
      setMatches(await matchRes.json());
    })();
  }, [multi]);

  return (
    <div className="App">
      <div className="articles">
        {articles ? (
          articles.map((art) => {
            return (
              <div href={art.url} className="article">
                <img src={art.image} alt=""></img>
                <div className="artText">
                  <h1>{art.title}</h1>
                  <span>{art.league}</span>
                  <p>{art.description}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>no shit</p>
        )}
      </div>

      <div>
        {table ? (
          <table>
            {
              <tr>
                {Object.keys(table[1].tables.total[0]).map((key) => {
                  return <td>{key}</td>;
                })}
              </tr>
            }

            {table[1].tables.total.map((row, i) => {
              return (
                <tr>
                  {Object.keys(row).map((key) => {
                    return (
                      <td>
                        {key == "crest" ? (
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
          </table>
        ) : (
          <p>some table shit</p>
        )}
        <button onClick={() => setMulti(multi - 1)}>Previous Day</button>
        <button onClick={() => setMulti(multi + 1)}>Next Day</button>
        {matches
          ? matches.map((league) => {
              return (
                <table id="fixtures">
                  <tr>
                    <td>
                      <h2>
                        <img id="leagueLogo" src={league.leagueLogo}></img>
                        {league.country} - {league.league}
                      </h2>
                    </td>
                  </tr>
                  {league.fixtures.map((match, i) => {
                    const date = new Date(
                      `${match.info.date}T${match.info.kickOff}Z`
                    );
                    return (
                      <tr>
                        <td id="home">
                          {match.teams.home.name}
                          <span>
                            <img id="crest" src={match.teams.home.crest}></img>
                          </span>
                        </td>
                        <td id="score">
                          {typeof match.result.home.score == "number"
                            ? `${match.result.home.score} : ${match.result.away.score}`
                            : date.toString() != "Invalid Date"
                            ? `${date.getHours()}:${
                                date.getMinutes() == 0
                                  ? "00"
                                  : date.getMinutes()
                              }`
                            : "TBC"}
                        </td>
                        <td id="away">
                          <span>
                            <img id="crest" src={match.teams.away.crest}></img>
                          </span>
                          {match.teams.away.name}
                        </td>
                        <td>{match.info.status}</td>
                      </tr>
                    );
                  })}
                </table>
              );
            })
          : null}
      </div>
    </div>
  );
}

export default App;

/*


 <table id="fixtures">
            {matches.map((league) => {
              return (
                <tr>
                  <td>
                    {league.country} - {league.league}{" "}
                    <img id="crest" src={league.leagueLogo}></img>
                  </td>
                </tr>
              );
            })}
            {matches[0].fixtures.map((match, i) => {
              if (i == 0) {
              }
              return (
                <tr>
                  <td id="home">
                    {match.homeTeam}{" "}
                    <span>
                      <img id="crest" src={match.homeCrest}></img>
                    </span>
                  </td>
                  <td>
                    {match.homeGoals} : {match.awayGoals}
                  </td>
                  <td>
                    <span>
                      <img id="crest" src={match.awayCrest}></img>
                    </span>
                    {match.awayTeam}
                  </td>
                </tr>
              );
            })}
          </table>



          */
