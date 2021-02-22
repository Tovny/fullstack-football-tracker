const createTable = require("./utilities/create-table");
const { EPLMatch, SerieAMatch } = require("./models/Match");

createTable(SerieAMatch, "gd").then((res) => console.log(res));
