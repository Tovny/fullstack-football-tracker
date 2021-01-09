const createFixtureObject = () => {
  const fixture = new Object();

  fixture.league = new Object();
  fixture.league.name = "";
  fixture.league.logo = "";

  fixture.info = new Object();
  const info = fixture.info;
  info.url = "";
  info.date = "";
  info.kickOff = "";
  info.stadium = "";
  info.matchday = NaN;
  info.status = "";

  fixture.teams = new Object();
  const teams = fixture.teams;
  teams.home = new Object();
  teams.away = new Object();
  teams.home.name = "";
  teams.home.crest = "";
  teams.away.name = "";
  teams.away.crest = "";

  fixture.result = {};
  const score = fixture.result;
  score.home = new Object();
  score.home.score = NaN;
  score.home.scorers = new Array();
  score.away = new Object();
  score.away.score = NaN;
  score.away.scorers = new Array();

  fixture.squads = new Object();
  const squads = fixture.squads;
  squads.home = new Object();
  squads.home.starters = new Array();
  squads.home.reserves = new Array();
  squads.away = new Object();
  squads.away.starters = new Array();
  squads.away.reserves = new Array();

  fixture.stats = new Object();

  fixture.timeline = new Object();
  fixture.timeline.home = new Array();
  fixture.timeline.away = new Array();

  return fixture;
};

module.exports = createFixtureObject;
