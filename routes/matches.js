const { Router } = require("express");

const models = require("../models/Match");
const League = require("../models/League");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const leagues = await League.find();
    const fixtures = new Array();

    let {
      date,
      team,
      hometeam,
      awayteam,
      league,
      matchday,
      status,
    } = req.query;

    if (!date) {
      date = new Date().toISOString();
      date = date.split("T")[0];
    }

    const searchObj = new Object();

    if (
      date != "all" &&
      !matchday &&
      !hometeam &&
      !awayteam &&
      !team &&
      !status
    )
      searchObj["info.date"] = date;

    if (matchday) searchObj["info.matchday"] = parseInt(matchday);

    if (status && !matchday)
      searchObj["info.status"] = new RegExp(status.replace("-", " "), "i");

    if (league) {
      searchObj["league.name"] = new RegExp(league.replace("-", " "), "i");

      if (team && !hometeam && !awayteam)
        searchObj.$or = [
          { "teams.home.name": new RegExp(team.replace("-", " "), "i") },
          { "teams.away.name": new RegExp(team.replace("-", " "), "i") },
        ];

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
    }

    for (league of leagues) {
      let leagueFixtures;

      leagueFixtures = await models[league.model]
        .find(searchObj)
        .sort({ "info.date": 1, "info.kickOff": 1 });

      if (leagueFixtures.length > 0) {
        const leagueObj = {
          country: league["_doc"].country,
          league: league["_doc"].league,
          logo: league["_doc"].logo,
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
