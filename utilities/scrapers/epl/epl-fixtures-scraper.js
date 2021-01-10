const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrollToBottom = require("../puppeteer-utilities/scroll-to-bottom");

const scrapeEPLFixtures = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: true });

    const urls = [
      "https://www.premierleague.com/results",
      "https://www.premierleague.com/fixtures",
    ];

    let fixtures = [];

    for (url of urls) {
      const page = await browser.newPage();

      await page.goto(url);

      await scrollToBottom(page);

      const data = await page.content();

      await page.close();

      if (data) {
        const $ = cheerio.load(data);

        if (url == "https://www.premierleague.com/fixtures")
          await browser.close();

        $("div[data-ui-tab='First Team']")
          .find(
            ".matchFixtureContainer[data-competition='Premier League'] div:nth-child(1)"
          )
          .each((i, fixture) => {
            const match = new Object();

            match.url = "https:" + $(fixture).attr("data-href");

            $(fixture)
              .find(".teams .shortname")
              .each((i, team) => {
                if (i == 0) {
                  match.homeTeam = $(team).text();
                } else {
                  match.awayTeam = $(team).text();
                }
              });

            const status = $(fixture).find("span.score").text();

            if (status) {
              const [homeScore, awayScore] = status.split("-");
              match.homeScore = parseInt(homeScore);
              match.awayScore = parseInt(awayScore);

              if (url.includes("results")) {
                match.status = "Full Time";
                fixtures.unshift(match);
              } else {
                match.status = "Scheduled";
                fixtures.push(match);
              }

              return;
            }

            const matchDate = new Date(
              $(fixture)
                .parent()
                .parent()
                .parent()
                .attr("data-competition-matches-list") +
                " " +
                $(fixture).find(".teams time").text()
            );

            if (matchDate.toString() == "Invalid Date") {
              match.date = "TBC";
              match.kickOff = "TBC";
            } else {
              const [date, time] = matchDate.toISOString().split("T");
              match.date = date;
              match.kickOff = time.slice(0, 5);
            }
            fixtures.push(match);
          });
      }
    }

    return fixtures;
  } catch (err) {
    console.log(err);
  }
};

module.exports = scrapeEPLFixtures;
