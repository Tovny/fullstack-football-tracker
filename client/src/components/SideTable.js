import "./SideTable.scss";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { x_auth } from "../config/";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import getTables from "../redux/actions/table-actions";

const SideTable = () => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables);
  const [selectedTable, setSelectedTable] = useState(0);
  const [direction, setDirection] = useState("tableTransitionRight");

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://serene-everglades-51285.herokuapp.com/api/tables`,
        {
          headers: { "x-auth": x_auth },
        }
      );

      const data = await res.json();

      dispatch(getTables(data));
    })();
  }, [dispatch]);

  const changeTable = (num) => {
    if (selectedTable + num >= 0 && selectedTable + num < tables.length) {
      setSelectedTable(selectedTable + num);
    } else if (selectedTable + num < 0) {
      setSelectedTable(tables.length - 1);
    } else if (selectedTable + num >= tables.length) {
      setSelectedTable(0);
    }
  };

  return (
    <div className="tableContainer">
      {tables ? (
        <SwitchTransition>
          <CSSTransition
            key={selectedTable}
            timeout={250}
            classNames={direction}
          >
            <table>
              <thead>
                <tr>
                  <th colSpan="2">
                    <div id="leagueHeading">
                      <FaChevronLeft
                        id="arrowBack"
                        onClick={async () => {
                          await new Promise((res) => {
                            setDirection("tableTransitionLeft");
                            res();
                          });
                          changeTable(-1);
                        }}
                      />
                      {
                        <Link to={`/tables${selectedTable}`}>
                          {tables[selectedTable].league}
                        </Link>
                      }
                      <FaChevronRight
                        id="arrowForward"
                        onClick={async () => {
                          await new Promise((res) => {
                            setDirection("tableTransitionRight");
                            res();
                          });
                          changeTable(1);
                        }}
                      />
                    </div>
                  </th>
                  <th>P</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>

              <tbody>
                {tables[selectedTable].tables.total.map((row) => {
                  return (
                    <tr key={row["#"]}>
                      <td className="position">{row["#"]}</td>
                      <td className="club">{row.team}</td>
                      <td>{row.played}</td>
                      <td>{row.gd}</td>
                      <td>{row.points}</td>
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

export default SideTable;
