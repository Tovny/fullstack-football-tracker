const scrapeSerieAFixtures = require("./scrapers/serie-a/serie-a-fixtures-scraper");
const scrapeSerieAMatchInfo = require("./scrapers/serie-a/serie-a-match-info-scraper");
const scrapeSerieANews = require("./scrapers/serie-a/serie-a-news-scraper");
const { SerieAMatch } = require("../models/Match");
const League = require("../models/League");
const Table = require("../models/Table");
const Article = require("../models/Article");
const createTable = require("./create-table");

const SerieA = {
  getMatches: async () => {
    try {
      const res = await SerieAMatch.find();
      return res;
    } catch (err) {
      console.log(err);
    }
  },

  updateAllFixtureChanges: async () => {
    try {
      const dbRes = await SerieAMatch.find();
      const scrapeRes = await scrapeSerieAFixtures();

      const dbFixtures = new Object();

      dbRes.forEach((fix) => {
        const homeTeam = fix.teams.home.name.toLowerCase();
        const awayTeam = fix.teams.away.name.toLowerCase();

        const fixKey = `${homeTeam}_${awayTeam}`;

        dbFixtures[fixKey] = fix;
      });

      for (let scrapedFix of scrapeRes) {
        const dbFixture =
          dbFixtures[
            `${scrapedFix.teams.home.name}_${scrapedFix.teams.away.name}`
          ];

        const scrapedResult = scrapedFix.result;
        const scrapedInfo = scrapedFix.info;
        const dbResult = dbFixture.result;
        const dbInfo = dbFixture.info;

        if (scrapedInfo.hasOwnProperty("url")) {
          if (
            scrapedResult.home.score != dbResult.home.score ||
            scrapedResult.away.score != dbResult.away.score ||
            scrapedInfo.url != dbInfo.url ||
            scrapedInfo.date != dbInfo.date ||
            scrapedInfo.kickOff != dbInfo.kickOff
          ) {
            const newScrape = await scrapeSerieAMatchInfo(scrapedInfo.url);
            await SerieAMatch.updateOne(dbFixture, newScrape);
          }
        } else {
          if (
            !Object.is(scrapedResult.home.score, dbResult.home.score) ||
            !Object.is(scrapedResult.away.score, dbResult.away.score) ||
            scrapedInfo.url != dbInfo.url ||
            scrapedInfo.date != dbInfo.date ||
            scrapedInfo.kickOff != dbInfo.kickOff
          ) {
            await SerieAMatch.updateOne(dbFixture, scrapedFix);
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
        country: "Italy",
        league: "Serie A",
      });

      const league = await League.find({
        country: "Italy",
        league: "Serie A",
      });
      const deductions = league[0].deductions;
      const tables = await createTable(SerieAMatch, "h2h", deductions);

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
            { country: "Italy", league: "Serie A" },
            tableObj
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  updateArticles: async () => {
    try {
      const dbArticles = await Article.find();
      const articleLinks = dbArticles.map((article) => article.url);
      const doneLinks = articleLinks.filter((url) =>
        url.includes("legaseriea.it")
      );

      const scrape = await scrapeSerieANews();

      for (let article of scrape) {
        if (!doneLinks.includes(article.url)) {
          const newArticle = new Article(article);

          newArticle.save();
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = SerieA;
