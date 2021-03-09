const mongoose = require("mongoose");
const { mongoURI } = require("./config/");
const PremierLeague = require("./utilities/premier-league");
const SerieA = require("./utilities/serie-a");

const leagues = new Array();

leagues.push(SerieA);
leagues.push(PremierLeague);

(async () => {
  try {
    process.setMaxListeners(0);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    const updateAllData = async () => {
      console.log("Starting update");
      for (let league of leagues) {
        await league.updateAllFixtureChanges();
        await league.updateArticles();
        await league.updateTables();
      }
      console.log("Update successful");
    };

    const updateDaily = (callback, hour = 0, minute = 0) => {
      const dayMiliseconds = 1000 * 60 * 60 * 24;

      const today = new Date();
      today.setHours(hour, minute, 0, 0);

      const timeUntilUpdate = today.getTime() + dayMiliseconds - Date.now();

      setTimeout(callback, timeUntilUpdate - dayMiliseconds);

      setTimeout(() => {
        callback();
        setInterval(callback, dayMiliseconds);
      }, timeUntilUpdate);
    };

    updateDaily(updateAllData, 4);
  } catch (err) {
    console.log(err);
  }
})();
