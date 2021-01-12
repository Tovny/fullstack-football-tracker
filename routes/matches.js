const { Router } = require("express");

const models = require("../models/Match");
const League = require("../models/League");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const leagues = await League.find();
    const fixtures = new Array();

    let { date, team, hometeam, awayteam, league } = req.query;

    if (!date) {
      date = new Date().toISOString();
      date = date.split("T")[0];
    }

    const searchObj = new Object();

    if (date != "all") searchObj["info.date"] = date;
    if (team) team = new RegExp(team.replace("-", " "), "i");
    if (hometeam)
      searchObj["teams.home.name"] = new RegExp(
        hometeam.replace("-", " "),
        "i"
      );
    if (awayteam)
      searchObj["teams.away.name"] = new RegExp(
        awayteam.replace("-", " "),
        "i"
      );
    if (league)
      searchObj["league.name"] = new RegExp(league.replace("-", " "), "i");

    for (league of leagues) {
      let leagueFixtures;

      if (team) {
        leagueFixtures = await models[league.model]
          .find({
            $or: [{ "teams.home.name": team }, { "teams.away.name": team }],
          })
          .sort({ "info.date": 1, "info.kickOff": 1 });
      } else {
        leagueFixtures = await models[league.model]
          .find(searchObj)
          .sort({ "info.date": 1, "info.kickOff": 1 });
      }

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
