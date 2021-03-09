const { Router } = require("express");

const League = require("../models/League");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const response = await League.find();

    const leagues = new Array();

    for (league of response) {
      const leagueObj = {
        country: league["_doc"].country,
        league: league["_doc"].league,
        logo: league["_doc"].logo,
        teams: league["_doc"].teams,
        rounds: league["_doc"].rounds,
      };
      leagues.push(leagueObj);
    }

    res.json(leagues);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
