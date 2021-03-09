const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const articleRoutes = require("./routes/articles");
const matchRoutes = require("./routes/matches");
const tableRoutes = require("./routes/tables");
const leagueRoutes = require("./routes/leagues");

const { mongoURI, PORT } = require("./config/");

(async () => {
  try {
    const app = express();

    app.use(cors());

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Database connected");

    app.use("/articles", articleRoutes);
    app.use("/matches", matchRoutes);
    app.use("/tables", tableRoutes);
    app.use("/leagues", leagueRoutes);

    app.listen(PORT, () => console.log(`App live on port ${PORT}`));
  } catch (err) {}
})();
