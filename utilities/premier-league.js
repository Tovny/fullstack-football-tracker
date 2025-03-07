const scrapeEPLFixtures = require("./scrapers/epl/epl-fixtures-scraper");
const scrapeEPLMatchInfo = require("./scrapers/epl/epl-match-info-scraper");
const {
  scrapeEPLNewsLinks,
  scrapeEPLArticles,
} = require("./scrapers/epl/epl-news-scraper");
const { EPLMatch } = require("../models/Match");
const League = require("../models/League");
const Table = require("../models/Table");
const Article = require("../models/Article");
const createTable = require("./create-table");

const PremierLeague = {
  getMatches: async () => {
    try {
      const res = await EPLMatch.find();
      return res;
    } catch (err) {}
  },

  updateAllFixtureChanges: async () => {
    try {
      const dbRes = await EPLMatch.find();
      const scrapeRes = await scrapeEPLFixtures();

      const dbFixtures = new Object();

      dbRes.forEach((fix) => {
        const homeTeam = fix.teams.home.shortName;
        const awayTeam = fix.teams.away.shortName;

        const fixKey = `${homeTeam}_${awayTeam}`;

        dbFixtures[fixKey] = fix;
      });

      for (let scrapedFix of scrapeRes) {
        const dbFixture =
          dbFixtures[`${scrapedFix.homeTeam}_${scrapedFix.awayTeam}`];

        const dbResult = dbFixture.result;
        const dbInfo = dbFixture.info;

        if (scrapedFix.hasOwnProperty("status")) {
          if (
            scrapedFix.homeScore != dbResult.home.score ||
            scrapedFix.awayScore != dbResult.away.score ||
            scrapedFix.url != dbInfo.url
          ) {
            const newScrape = await scrapeEPLMatchInfo(scrapedFix.url);

            newScrape.teams.home.shortName = scrapedFix.homeTeam;
            newScrape.teams.away.shortName = scrapedFix.awayTeam;

            await EPLMatch.updateOne(dbFixture, newScrape);
          }
        } else {
          if (
            scrapedFix.url != dbInfo.url ||
            scrapedFix.date != dbInfo.date ||
            scrapedFix.kickOff != dbInfo.kickOff
          ) {
            const newScrape = await scrapeEPLMatchInfo(scrapedFix.url);

            newScrape.teams.home.shortName = scrapedFix.homeTeam;
            newScrape.teams.away.shortName = scrapedFix.awayTeam;

            await EPLMatch.updateOne(dbFixture, newScrape);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  updateTables: async () => {
    try {
      const dbTable = await Table.find({
        country: "England",
        league: "Premier League",
      });

      const league = await League.find({
        country: "England",
        league: "Premier League",
      });

      const deductions = league[0].deductions;

      const specialStatus = [
        [0, "Champions League"],
        [1, "Champions League"],
        [2, "Champions League"],
        [3, "Champions League"],
        [4, "Europa League"],
        [17, "Relegation"],
        [18, "Relegation"],
        [19, "Relegation"],
      ];

      const tables = await createTable(
        EPLMatch,
        "gd",
        deductions,
        specialStatus
      );

      if (
        tables.hasOwnProperty("total") &&
        tables.hasOwnProperty("home") &&
        tables.hasOwnProperty("away")
      ) {
        const tableObj = {
          country: league[0].country,
          league: league[0].league,
          logo: league[0].logo,
          tables: tables,
        };

        if (dbTable.length < 1) {
          const newTable = new Table(tableObj);
          await newTable.save();
        } else {
          await Table.updateOne(
            { country: "England", league: "Premier League" },
            tableObj
          );
        }
      }
    } catch (err) {}
  },

  updateArticles: async () => {
    try {
      const dbArticles = await Article.find();
      const articleLinks = dbArticles.map((article) => article.url);
      const doneLinks = articleLinks.filter((url) =>
        url.includes("premierleague.com")
      );

      const scrapedArticleLinks = await scrapeEPLNewsLinks();

      const toDo = scrapedArticleLinks.filter(
        (article) => !doneLinks.includes(article.url)
      );

      const articles = await scrapeEPLArticles(toDo);

      for (let article of articles) {
        const newArticle = new Article(article);

        await newArticle.save();
      }
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = PremierLeague;
