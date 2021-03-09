const { Schema, model } = require("mongoose");

const tableSchema = Schema({
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
  tables: {
    total: {
      type: Array,
      required: true,
    },
    home: {
      type: Array,
      required: true,
    },
    away: {
      type: Array,
      required: true,
    },
  },
});

const Table = model("tables", tableSchema);

module.exports = Table;
