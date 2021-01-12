const { Schema, model } = require("mongoose");

const matchSchema = Schema({
  league: {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  info: {
    url: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    kickOff: {
      type: String,
      required: true,
      index: true,
    },
    stadium: {
      type: String,
      required: true,
    },
    matchday: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
    referee: {
      type: String,
      required: false,
    },
  },
  teams: {
    home: {
      name: {
        type: String,
        required: true,
        index: true,
      },
      crest: {
        type: String,
        required: true,
      },
      shortName: {
        type: String,
        required: false,
      },
    },
    away: {
      name: {
        type: String,
        required: true,
        index: true,
      },
      crest: {
        type: String,
        required: true,
      },
      shortName: {
        type: String,
        required: false,
      },
    },
  },
  result: { type: Object, required: true },
  squads: { type: Object, required: true },
  stats: { type: Object, required: true },
  timeline: { type: Object, required: true },
});

const EPLMatch = model("epl_matches", matchSchema);
const SerieAMatch = model("serie_a_matches", matchSchema);

module.exports = { EPLMatch, SerieAMatch };
