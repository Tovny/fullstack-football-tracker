const { Schema, model } = require("mongoose");

const articleSchema = new Schema({
  date: {
    type: String,
    required: true,
    index: true,
  },
  time: {
    type: String,
    required: true,
    index: true,
  },
  league: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const Article = model("articles", articleSchema);

module.exports = Article;
