const { Router } = require("express");
const auth = require("../utilities/middleware/auth");

const Article = require("../models/Article");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1, time: -1 });
    res.json(articles);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
