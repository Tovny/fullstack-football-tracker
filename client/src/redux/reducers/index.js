import { combineReducers } from "redux";
import fixturesReducer from "./fixtures";
import tablesReducer from "./tables";
import newsReducer from "./news";
import leagueReducer from "./leagues";
import filterReducer from "./filters";

const rootReducer = combineReducers({
  fixtures: fixturesReducer,
  tables: tablesReducer,
  news: newsReducer,
  leagues: leagueReducer,
  filters: filterReducer,
});

export default rootReducer;
