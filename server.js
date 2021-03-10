const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const articleRoutes = require("./routes/articles");
const matchRoutes = require("./routes/matches");
const tableRoutes = require("./routes/tables");
const leagueRoutes = require("./routes/leagues");

const { mongoURI, PORT } = require("./config");

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

    app.use("/api/articles", articleRoutes);
    app.use("/api/matches", matchRoutes);
    app.use("/api/tables", tableRoutes);
    app.use("/api/leagues", leagueRoutes);

    if (process.env.NODE_ENV === "production") {
      app.use(express.static("client/build"));

      app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
      });
    }

    app.listen(PORT || 5000, "0.0.0.0", () =>
      console.log(`App live on port ${PORT}`)
    );
  } catch (err) {}
})();
