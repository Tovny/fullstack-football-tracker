const cheerio = require("cheerio");
const fetch = require("node-fetch");

const createFixtureObject = require("../../create-fixture-object");

const scrapeSerieAFixtures = async () => {
  try {
    const fixtures = new Array();

    for (let i = 1; i <= 38; i++) {
      const res = await fetch(
        `http://www.legaseriea.it/en/serie-a/fixture-and-results/2020-21/UNICO/UNI/${i}`
      );
      const html = await res.text();

      const $ = cheerio.load(html);

      $(".box-partita").each((j, match) => {
        const fixture = createFixtureObject();

        fixture.league.name = "Italian Serie A";
        fixture.league.logo = $("#squadre_header .img-responsive").attr("src");

        const info = fixture.info;

        $(match).find(".link-matchreport a:nth-child(3)").attr("href")
          ? (info.url =
              "http://www.legaseriea.it" +
              $(match).find(".link-matchreport a:nth-child(3)").attr("href"))
          : delete info.url;

        info.matchday = $(".risultati h3")
          .text()
          .replace(/\s\s+/g, " ")
          .trim()
          .split("-")[1]
          .trim();

        fixture.teams.home.name = $(match)
          .find(".risultatosx h4")
          .text()
          .replace(/\s\s+/g, " ")
          .trim()
          .toLowerCase();
        fixture.teams.home.crest =
          "http://www.legaseriea.it" +
          $(match).find(".risultatosx img").attr("src");

        fixture.teams.away.name = $(match)
          .find(".risultatodx h4")
          .text()
          .replace(/\s\s+/g, " ")
          .trim()
          .toLowerCase();
        fixture.teams.away.crest =
          "http://www.legaseriea.it" +
          $(match).find(".risultatodx img").attr("src");

        (() => {
          // Parse the date data

          let [date, kickOff] = $(match)
            .find(".datipartita span:nth-child(1)")
            .text()
            .split(" ");

          if (!kickOff) kickOff = "20:45";

          let [day, month, year] = date.split("/");
          month = parseInt(month) - 1;
          let [hour, minute] = kickOff.split(":");

          date = new Date(year, month, day, hour, minute);

          if (date.toString() == "Invalid Date") {
            info.date = "TBC";
            info.kickOff = "TBC";
          } else {
            [date, kickOff] = date.toISOString().split("T");
            info.date = date;
            info.kickOff = kickOff.slice(0, 5);
          }

          // Parse the stadium and referee data

          let text = $(match)
            .find(".datipartita")
            .text()
            .replace(/\s\s+/g, "\n")
            .split("\n");
          text.forEach((para) => {
            if (para.includes("Stadium")) {
              let stadium = para
                .split(/stadium:/i)[1]
                .trim()
                .toLowerCase();
              info.stadium = stadium;
            }
            if (para.includes("Referee")) {
              let referee = para
                .split(/referee:/i)[1]
                .trim()
                .toLowerCase();
              info.referee = referee;
            }
          });
        })();

        if ($(match).find(".risultatosx span").text()) {
          const result = fixture.result;

          const homeScore = parseInt($(match).find(".risultatosx span").text());
          const awayScore = parseInt($(match).find(".risultatodx span").text());

          result.home.score = homeScore;
          result.away.score = awayScore;
        }

        info.matchday = i;

        info.status = "Scheduled";

        fixtures.push(fixture);
      });
    }
    return fixtures;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = scrapeSerieAFixtures;
