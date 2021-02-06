import "./SideTable.scss";
import { useState, useEffect, useRef } from "react";
import x_auth from "../config/default";
import ArrowBack from "@material-ui/icons/ArrowBackIosOutlined";
import ArrowForward from "@material-ui/icons/ArrowForwardIosOutlined";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import getTables from "../redux/actions/table-actions";

const SideTable = ({ setWidth }) => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables);
  const [selectedTable, setSelectedTable] = useState(0);
  const [direction, setDirection] = useState("tableTransitionRight");
  const tableRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/tables", {
        headers: { "x-auth": x_auth },
      });

      const data = await res.json();

      dispatch(getTables(data));
    })();
  }, [dispatch]);

  useEffect(() => {
    const child = tableRef.current;

    if (child) setWidth({ width: child.getBoundingClientRect().width });
  }, [setWidth, tables]);

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
            addEndListener={(node, done) =>
              node.addEventListener("transitionend", done, false)
            }
            classNames={direction}
          >
            <table ref={tableRef}>
              <thead>
                <tr>
                  <th colSpan="2">
                    <div id="leagueHeading">
                      <ArrowBack
                        id="arrowBack"
                        onClick={async () => {
                          await new Promise((res) => {
                            setDirection("tableTransitionLeft");
                            res();
                          });
                          changeTable(-1);
                        }}
                      />
                      {tables[selectedTable].league}
                      <ArrowForward
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
                      <td id="position">{row["#"]}</td>
                      <td id="club">{row.team}</td>
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
