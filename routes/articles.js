const { Router } = require("express");
const auth = require("../utilities/middleware/auth");

const Article = require("../models/Article");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    let { limit } = req.query;

    limit = parseInt(limit);

    if (!limit) {
      limit = 10;
    }

    const articles = await Article.find()
      .sort({ date: -1, time: -1 })
      .limit(limit);
    res.json(articles);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
