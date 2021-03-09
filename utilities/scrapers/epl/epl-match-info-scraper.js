const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const createFixtureObject = require("../../create-fixture-object");
const delay = require("../puppeteer-utilities/async-delay");

const scrapeEPLMatchInfo = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    await delay(4000);

    await page.evaluate(() => {
      document.querySelector("li[data-tab-index='2']").click();
    });

    await delay(1000);

    const data = await page.content();

    if (data) {
      const $ = cheerio.load(data);

      let fixture = createFixtureObject();

      $(".matchWeekNavContainer").remove();

      fixture.league.name = "English Premier League";
      fixture.league.logo =
        "https://banner2.cleanpng.com/20180711/vg/kisspng-201617-premier-league-english-football-league-l-lion-emoji-5b460f06eeac18.5589169115313180229776.jpg";

      const info = fixture.info;

      info.url = url;

      const teams = fixture.teams;

      teams.home.name = $(".teamsContainer .home .long").text();
      teams.home.crest = $(".teamsContainer .home .badge-image")
        .attr("srcset")
        .split("png, ")[1]
        .split(" 2x")[0];
      teams.away.name = $(".teamsContainer .away .long").text();
      teams.away.crest = $(".teamsContainer .away .badge-image")
        .attr("srcset")
        .split("png, ")[1]
        .split(" 2x")[0];

      const result = fixture.result;

      result.home.score = parseInt(
        $(".matchScoreContainer .score").text().split("-")[0]
      );
      result.away.score = parseInt(
        $(".matchScoreContainer .score").text().split("-")[1]
      );

      const matchDate = new Date(
        $(".matchDate.renderMatchDateContainer").text() +
          " " +
          $(".kickoff .renderKOContainer").text()
      );

      if (matchDate.toString() == "Invalid Date") {
        info.date = "TBC";
        info.kickOff = "TBC";
      } else {
        const [date, time] = matchDate.toISOString().split("T");
        info.date = date;
        info.kickOff = time.slice(0, 5);
      }

      info.matchday = parseInt(
        $(".dropDown .current .long").text().split("week ")[1]
      );

      const stadium = $(".stadium").text();
      if (stadium) info.stadium = stadium.trim();

      const referee = $(".referee").text();
      if (referee) info.referee = referee.trim();

      const status = $(".matchTimeContainer .js-match-time strong").text();

      if (status == "FT") {
        info.status = "Full Time";
      } else {
        info.status = "Scheduled";
      }

      const squads = fixture.squads;

      const parseSquads = (sq) => {
        $(`.matchLineups .${sq}Lineup .startingLineUpContainer .player`).each(
          (i, pl) => {
            let player = [];
            $(pl).find(".number span").remove().text();
            $(pl).find(".info .name div").remove();

            player.push(parseInt($(pl).find(".number ").text()));
            player.push($(pl).find(".info .name").text().replace(/\s\s+/g, ""));

            if (i <= 10) {
              squads[`${sq}`].starters.push(player);
            } else {
              squads[`${sq}`].reserves.push(player);
            }
          }
        );
      };

      parseSquads("home");
      parseSquads("away");

      $(".matchCentreStatsContainer tr").each((i, row) => {
        let stat = $(row).find("td:nth-child(2)").text();

        fixture.stats[stat] = {};
        if (stat == "Possession %") {
          fixture.stats[stat].home = parseFloat(
            $(row).find("td:nth-child(1)").text()
          );
          fixture.stats[stat].away = parseFloat(
            $(row).find("td:nth-child(3)").text()
          );
        } else {
          fixture.stats[stat].home = parseInt(
            $(row).find("td:nth-child(1)").text()
          );
          fixture.stats[stat].away = parseInt(
            $(row).find("td:nth-child(3)").text()
          );
        }
      });

      const timelineParser = (sq) => {
        $(`.timeLineEventsContainer .event.${sq}`).each((i, evnt) => {
          let event = {};

          if ($(evnt).find(".sub-w").text()) {
            event.minute = $(evnt).find("time").text();
            event.event = $(evnt)
              .find(".eventInfoHeader .visuallyHidden")
              .text();
            event.playerOut = $(evnt)
              .find(".eventInfoContent img")
              .attr("alt")
              .split("Photo for ")[1];
            event.playerIn = $(evnt)
              .find(".eventInfoContent.subOn img")
              .attr("alt")
              .split("Photo for ")[1];
          } else if (
            (event.event =
              $(evnt).find(".icn .visuallyHidden").text() ==
              "label.penalty.scored")
          ) {
            event.minute = $(evnt).find("time").text();
            event.event = "Penalty scored";

            const player = $(evnt).find("a.name").text().split(".")[1];
            if (player) event.player = player.trim();
          } else {
            event.minute = $(evnt).find("time").text();
            event.event = $(evnt).find(".icn .visuallyHidden").text();

            const player = $(evnt).find("a.name").text().split(".")[1];
            if (player) event.player = player.trim();
          }

          fixture.timeline[sq].push(event);
        });
      };

      timelineParser("home");
      timelineParser("away");

      const createScorers = (team) => {
        fixture.timeline[team].forEach((e) => {
          if (e.event == "Goal")
            result[`${team}`].scorers.push(`${e.minute} ${e.player}`);
          if (e.event == "Own Goal")
            result[`${team}`].scorers.push(`${e.minute} ${e.player} (OG)`);
          if (e.event == "Penalty scored")
            result[`${team}`].scorers.push(`${e.minute} ${e.player} (P)`);
        });
      };

      createScorers("home");
      createScorers("away");

      if (info.status == "Full Time") {
        let winner;

        if (result.home.score > result.away.score) {
          winner = "home";
        } else if (result.home.score < result.away.score) {
          winner = "away";
        } else {
          winner = "draw";
        }
        fixture.result.winner = winner;
      }

      return fixture;
    }
    await browser.close();
  } catch (err) {
    console.log(err);
  }
};

module.exports = scrapeEPLMatchInfo;
