const { Router } = require("express");

const models = require("../models/Match");
const League = require("../models/League");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const leagues = await League.find();
    const fixtures = new Array();

    let multi = parseInt(req.headers.day);
    if (!multi) multi = 0;
    const day = 1000 * 60 * 60 * 24 * multi;

    let date = new Date(Date.now() + day).toISOString().split("T")[0];

    for (league of leagues) {
      const leagueFixtures = await models[league.model]
        .find({ "info.date": date })
        .sort({ "info.date": 1, "info.kickOff": 1 });

      if (leagueFixtures.length > 0) {
        const leagueObj = {
          country: league["_doc"].country,
          league: league["_doc"].league,
          leagueLogo: league["_doc"].leagueLogo,
          fixtures: leagueFixtures,
        };

        fixtures.push(leagueObj);
      }
    }

    res.json(fixtures);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
