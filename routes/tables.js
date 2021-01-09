const { Router } = require("express");

const Table = require("../models/Table");
const auth = require("../utilities/middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.sendStatus(400);
    console.log(err);
  }
});

module.exports = router;
