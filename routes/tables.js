const { Router } = require("express");

const Table = require("../models/Table");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    let { league } = req.query;
    const searchObj = new Object();

    if (league) searchObj.league = new RegExp(league.replace("-", " "), "i");

    const tables = await Table.find(searchObj);
    res.json(tables);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
