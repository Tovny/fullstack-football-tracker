const { Schema, model } = require("mongoose");

const leagueSchema = Schema({
  country: {
    type: String,
    required: true,
  },
  league: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  deductions: {
    type: Array,
    required: false,
  },
  teams: {
    type: Array,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
});

const League = model("leagues", leagueSchema);

module.exports = League;
