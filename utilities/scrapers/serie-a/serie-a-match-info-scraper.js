const cheerio = require("cheerio");
const fetch = require("node-fetch");

const createFixtureObject = require("../../create-fixture-object");

const scrapeSerieAMatchInfo = async (url) => {
  try {
    const res = await fetch(url);
    const html = await res.text();

    if (res.status == 200 && html) {
      const $ = cheerio.load(html);

      const fixture = createFixtureObject();

      const info = fixture.info;

      (() => {
        let [date, kickOff] = $(".report-data span:nth-child(1)")
          .text()
          .split(" - ");

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
      })();

      fixture.league.name = "Italian Serie A";
      fixture.league.logo = $("#squadre_header .img-responsive").attr("src");

      info.url = url;

      (() => {
        let data = $(".report-data");

        let status = $(data).find(".dcr").text();

        if (status == "MATCH FORFEITED") {
          info.status = "Match Forfeited";
        } else if (status == "Finished") {
          info.status = "Full Time";
        } else {
          info.status = "Scheduled";
        }

        let text = data.text().split("\n");
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

      info.matchday = parseInt(
        $(".vocefiltro.mostrascelte h2").text().split("|")[2]
      );

      const teams = fixture.teams;

      teams.home.name = $(".report-squadra.squadra-a").text().toLowerCase();
      teams.home.crest =
        "https://www.legaseriea.it" +
        $(".squadra-logo.squadra-a img").attr("src");

      teams.away.name = $(".report-squadra.squadra-b").text().toLowerCase();
      teams.away.crest =
        "https://www.legaseriea.it" +
        $(".squadra-logo.squadra-b img").attr("src");

      const parseScorers = (squad) => {
        let data = $(`.report-marcatori.${squad}`);

        let goalTime = [];

        $(data)
          .find("span")
          .each((i, min) => {
            goalTime.push($(min).text().replace(/\s\s+/g, ""));
          });

        goalTime = goalTime.filter((min) => min.length > 0);

        $(data).find("span").remove();
        scorers = $(data)
          .text()
          .replace(/\n/g, "|")
          .replace(/\s\s+/g, " ")
          .split("|");

        scorers = scorers.map((elt) => elt.trim());
        scorers = scorers.filter((elt) => elt.length > 0);

        let goals = new Array();

        goalTime.map((min, i) => {
          goals.push(min.concat(" ", scorers[i]));
        });

        return goals;
      };

      const result = fixture.result;

      result.home.score = parseInt($(".squadra-risultato.squadra-a").text());
      result.away.score = parseInt($(".squadra-risultato.squadra-b").text());

      result.home.scorers = parseScorers("squadra-a");

      result.away.scorers = parseScorers("squadra-b");

      // Parse the squads
      (() => {
        const squads = fixture.squads;

        $(".report-formazioni .colonna-squadra").each((i, squad) => {
          const squadData = $(squad).find("tbody tr");

          $(squadData).each((j, row) => {
            let number = parseInt($(row).find("td:nth-child(1)").text());
            let player = $(row).find("td:nth-child(2)").text();
            if (i == 0) {
              squads.home.starters.push([number, player]);
            } else if (i == 1) {
              squads.away.starters.push([number, player]);
            }
          });
        });

        $(".report-panchina .colonna-squadra").each((i, squad) => {
          const squadData = $(squad).find("tbody tr");

          $(squadData).each((j, row) => {
            let number = parseInt($(row).find("td:nth-child(1)").text());
            let player = $(row).find("td:nth-child(2)").text();
            if (i == 0) {
              squads.home.reserves.push([number, player]);
            } else if (i == 1) {
              squads.away.reserves.push([number, player]);
            }
          });
        });
      })();

      // Parse the match statistics

      $("#statistiche-comparate .riga").each((i, stat) => {
        const statistic = $(stat).find(".valoretitolo").text();

        fixture.stats[statistic] = new Object();
        const selector = fixture.stats[statistic];

        selector.home = parseInt($(stat).find(".valoresx").text());
        selector.away = parseInt($(stat).find(".valoredx").text());
      });

      const parseEvents = (elt, location) => {
        $(elt).each((i, event) => {
          let data = $(event).attr("data-original-title");
          fixture.timeline[location].push(new Object());
          const eventSelector = fixture.timeline[location][i];
          let [minute, innerEvent] = data.split(" - ");
          if (minute == "INT") minute = "45'";
          innerEvent.trim();

          eventSelector.minute = minute.trim();

          if (innerEvent.includes("Substitution:")) {
            let playerOff = innerEvent.split(" off ")[1].trim();
            let playerIn = innerEvent.split(" in ")[1].split(" and ")[0].trim();

            eventSelector.event = "Substitution";
            eventSelector.playerIn = playerIn;
            eventSelector.playerOff = playerOff;
          }

          if (innerEvent.includes("Yellow card")) {
            let player = innerEvent.split(" for ")[1].trim();

            eventSelector.event = "Yellow card";
            eventSelector.player = player;
          }

          if (innerEvent.includes(" scores a penalty")) {
            let player = innerEvent.split(" scores a penalty")[0].trim();

            eventSelector.event = "Penalty scored";
            eventSelector.player = player;
          }

          if (innerEvent.includes("Own goal by ")) {
            let player = innerEvent.split("Own goal by ")[1].trim();

            eventSelector.event = "Own goal";
            eventSelector.player = player;
          }

          if (innerEvent.includes("Goal by ")) {
            let player = innerEvent.split("Goal by ")[1].trim();

            eventSelector.event = "Goal";
            eventSelector.player = player;
          }

          if (innerEvent.includes("Red card for ")) {
            let player = innerEvent.split("Red card for ")[1].trim();

            eventSelector.event = "Red card";
            eventSelector.player = player;
          }

          if (innerEvent.includes("Two Bookings")) {
            let player = innerEvent.split("Sent-Off ")[1].trim();

            eventSelector.event = "Second yellow card";
            eventSelector.player = player;
          }
        });
      };

      parseEvents(".momenti-squadra1 a", "home");
      parseEvents(".momenti-squadra2 a", "away");

      if (info.status == "Full Time" || info.status == "Match Forfeited") {
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
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = scrapeSerieAMatchInfo;
