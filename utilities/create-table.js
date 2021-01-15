const createTable = async (model, sort, penalty = []) => {
  try {
    const res = await model.find({ "info.status": { $ne: "Scheduled" } });
    const scheduled = await model.find({ "info.status": "Scheduled" });

    const fixtures = new Object();

    const createFormObj = (fix, teamName) => {
      const fixture = new Object();

      fixture.homeTeam = fix.teams.home.name;
      fixture.homeCrest = fix.teams.home.crest;
      fixture.homeScore = fix.result.home.score;
      fixture.awayTeam = fix.teams.away.name;
      fixture.awayCrest = fix.teams.away.crest;
      fixture.awayScore = fix.result.away.score;
      fixture.date = fix.info.date;
      fixture.kickOff = fix.info.kickOff;

      if (fix.result.winner == "draw") {
        fixture.result = "D";
      } else if (fix.result.winner == "home") {
        if (teamName == fixture.homeTeam) {
          fixture.result = "W";
        } else {
          fixture.result = "L";
        }
      } else if (fix.result.winner == "away") {
        if (teamName == fixture.awayTeam) {
          fixture.result = "W";
        } else {
          fixture.result = "L";
        }
      }

      return fixture;
    };

    const createNextObj = (fix) => {
      const fixture = new Object();

      fixture.homeTeam = fix.teams.home.name;
      fixture.homeCrest = fix.teams.home.crest;
      fixture.awayTeam = fix.teams.away.name;
      fixture.awayCrest = fix.teams.away.crest;
      fixture.date = fix.info.date;
      fixture.kickOff = fix.info.kickOff;

      return fixture;
    };

    res.forEach((fix) => {
      const homeTeam = fix.teams.home.name;
      const awayTeam = fix.teams.away.name;

      const fixKey = `${homeTeam}_${awayTeam}`;

      fixtures[fixKey] = fix;
    });

    const teams = new Array();

    res.forEach((fix) => {
      const done = new Array();

      teams.forEach((team) => {
        done.push(team.name);
      });
      if (!done.includes(fix.teams.home.name)) {
        teams.push(fix.teams.home);
      }
      if (!done.includes(fix.teams.away.name)) {
        teams.push(fix.teams.away);
      }
    });

    const tables = new Object();

    tables.total = new Array();
    tables.home = new Array();
    tables.away = new Array();

    const total = tables.total;
    const home = tables.home;
    const away = tables.away;

    teams.forEach((team) => {
      let totalRow = new Object();
      let homeRow = new Object();
      let awayRow = new Object();

      [totalRow, homeRow, awayRow].forEach((table) => {
        table.team = team.name;
        if (team.shortName) table.shortName = team.shortName;
        table.crest = team.crest;
        table.played = 0;
        table.won = 0;
        table.drawn = 0;
        table.lost = 0;
        table.gf = 0;
        table.ga = 0;
        table.gd = 0;
        table.points = 0;
        table.form = new Array();
      });

      res.forEach((fix) => {
        if (fix.teams.home.name == team.name) {
          totalRow.played = totalRow.played + 1;

          homeRow.played = homeRow.played + 1;

          if (fix.result.winner == "home") {
            totalRow.won = totalRow.won + 1;
            homeRow.won = homeRow.won + 1;
          }

          if (fix.result.winner == "draw") {
            totalRow.drawn = totalRow.drawn + 1;
            homeRow.drawn = homeRow.drawn + 1;
          }

          if (fix.result.winner == "away") {
            totalRow.lost = totalRow.lost + 1;
            homeRow.lost = homeRow.lost + 1;
          }

          totalRow.gf = totalRow.gf + fix.result.home.score;
          homeRow.gf = homeRow.gf + fix.result.home.score;

          totalRow.ga = totalRow.ga + fix.result.away.score;
          homeRow.ga = homeRow.ga + fix.result.away.score;

          totalRow.gd = totalRow.gf - totalRow.ga;
          homeRow.gd = homeRow.gf - homeRow.ga;

          totalRow.points = totalRow.won * 3 + totalRow.drawn;
          homeRow.points = homeRow.won * 3 + homeRow.drawn;
        }

        if (fix.teams.away.name == team.name) {
          totalRow.played = totalRow.played + 1;

          awayRow.played = awayRow.played + 1;

          if (fix.result.winner == "away") {
            totalRow.won = totalRow.won + 1;
            awayRow.won = awayRow.won + 1;
          }

          if (fix.result.winner == "draw") {
            totalRow.drawn = totalRow.drawn + 1;
            awayRow.drawn = awayRow.drawn + 1;
          }

          if (fix.result.winner == "home") {
            totalRow.lost = totalRow.lost + 1;
            awayRow.lost = awayRow.lost + 1;
          }

          totalRow.gf = totalRow.gf + fix.result.away.score;
          awayRow.gf = awayRow.gf + fix.result.away.score;

          totalRow.ga = totalRow.ga + fix.result.home.score;
          awayRow.ga = awayRow.ga + fix.result.home.score;

          totalRow.gd = totalRow.gf - totalRow.ga;
          awayRow.gd = awayRow.gf - awayRow.ga;

          totalRow.points = totalRow.won * 3 + totalRow.drawn;
          awayRow.points = awayRow.won * 3 + awayRow.drawn;
        }
      });

      for (let fix of scheduled) {
        if (
          team.name == fix.teams.home.name ||
          team.name == fix.teams.away.name
        ) {
          const next = createNextObj(fix);
          totalRow.next = next;
          homeRow.next = next;
          awayRow.next = next;
          break;
        }
      }

      for (let i = res.length - 1; i >= 0; i--) {
        if (res[i].teams.home.name == team.name) {
          const fixture = createFormObj(res[i], team.name);
          if (totalRow.form.length < 5) totalRow.form.unshift(fixture);
          if (homeRow.form.length < 5) homeRow.form.unshift(fixture);
        }
        if (res[i].teams.away.name == team.name) {
          const fixture = createFormObj(res[i], team.name);
          if (totalRow.form.length < 5) totalRow.form.unshift(fixture);
          if (awayRow.form.length < 5) awayRow.form.unshift(fixture);
        }
      }

      [(total, home, away)].forEach((row) => {
        row.sort((a, b) => b.points - a.points);
      });

      total.push(totalRow);
      home.push(homeRow);
      away.push(awayRow);
    });

    penalty.forEach((pen) => {
      total.forEach((row) => {
        if (row.team == pen.team) {
          row.points = row.points - pen.deduction;
        }
      });

      if (pen.table == "home") {
        home.forEach((row) => {
          if (row.team == pen.team) {
            row.points = row.points - pen.deduction;
          }
        });
      }

      if (pen.table == "away") {
        away.forEach((row) => {
          if (row.team == pen.team) {
            row.points = row.points - pen.deduction;
          }
        });
      }
    });

    [total, home, away].forEach((table) => {
      table.sort((a, b) => b.points - a.points);
    });

    const sortByGd = (arr) => {
      for (let i = 1; i < arr.length; i++) {
        const bottomTeam = arr[i];
        const topTeam = arr[i - 1];

        const swapTeams = () => {
          const temp = topTeam;
          arr[i - 1] = bottomTeam;
          arr[i] = temp;
          i = 1;
        };

        if (bottomTeam.points == topTeam.points) {
          if (bottomTeam.gd > topTeam.gd) {
            swapTeams();
          }
          if (bottomTeam.gd == topTeam.gd) {
            if (bottomTeam.gf > topTeam.gf) {
              swapTeams();
            }
            if (bottomTeam.gf == topTeam.gf) {
              let match1 = fixtures[`${bottomTeam.team}_${topTeam.team}`];
              let match2 = fixtures[`${topTeam.team}_${bottomTeam.team}`];

              let bothMatchesPlayed = true;

              if (!match1 || !match2) bothMatchesPlayed = false;

              [match1, match2].forEach((match) => {
                let home = match.result.home;
                let away = match.result.away;

                if (!bothMatchesPlayed) {
                  return;
                } else {
                  home.score = parseInt(home.score);
                  away.score = parseInt(away.score);

                  const aboveTeamGoals =
                    match1.result.home.score + match2.result.away.score;
                  const belowTeamGoals =
                    match2.result.home.score + match1.result.away.score;

                  if (aboveTeamGoals > belowTeamGoals) {
                    swapTeams();
                  } else if (aboveTeamGoals == belowTeamGoals) {
                    const aboveTeamAwayGoals = match2.result.away.score;
                    const belowTeamAwayGoals = match1.result.away.score;

                    if (aboveTeamAwayGoals > belowTeamAwayGoals) {
                      swapTeams();
                    }
                  }
                }
              });
            }
          }
        }
      }
    };

    const sortByHeadToHead = (arr) => {
      for (let i = 1; i < arr.length; i++) {
        const bottomTeam = arr[i];
        const topTeam = arr[i - 1];

        if (bottomTeam.points == topTeam.points) {
          let match1 = fixtures[`${bottomTeam.team}_${topTeam.team}`];
          let match2 = fixtures[`${topTeam.team}_${bottomTeam.team}`];

          let bothMatchesPlayed = true;

          if (!match1 || !match2) bothMatchesPlayed = false;

          if (bothMatchesPlayed) {
            [match1, match2].forEach((match) => {
              let home = match.result.home;
              let away = match.result.away;

              home.score = parseInt(home.score);
              away.score = parseInt(away.score);
            });
          }

          const swapTeams = () => {
            const temp = topTeam;
            arr[i - 1] = bottomTeam;
            arr[i] = temp;
            i = 1;
          };

          if (!bothMatchesPlayed) {
            if (bottomTeam.played < topTeam.played) {
              swapTeams();
            }
            if (bottomTeam.played == topTeam.played) {
              if (bottomTeam.gd > topTeam.gd) {
                swapTeams();
              }
            }
          } else {
            const aboveTeamGoals =
              match1.result.home.score + match2.result.away.score;
            const belowTeamGoals =
              match2.result.home.score + match1.result.away.score;

            if (aboveTeamGoals > belowTeamGoals) {
              swapTeams();
            } else if (aboveTeamGoals == belowTeamGoals) {
              const aboveTeamAwayGoals = match2.result.away.score;
              const belowTeamAwayGoals = match1.result.away.score;

              if (aboveTeamAwayGoals > belowTeamAwayGoals) {
                swapTeams();
              } else if (aboveTeamAwayGoals == belowTeamAwayGoals) {
                if (bottomTeam.gd > topTeam.gd) {
                  swapTeams();
                }
              }
            }
          }
        }
      }
    };

    if (sort == "h2h") {
      [total, home, away].forEach((table) => {
        sortByHeadToHead(table);
      });
    }

    if (sort == "gd") {
      [total, home, away].forEach((table) => {
        sortByGd(table);
      });
    }

    [total, home, away].forEach((table) => {
      table.forEach((row, i) => {
        row["#"] = i + 1;
      });
    });

    return tables;
  } catch (err) {}
};

module.exports = createTable;
