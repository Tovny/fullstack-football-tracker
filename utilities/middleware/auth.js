const { x_auth } = require("../../config");

const auth = (req, res, next) => {
  const token = req.header("x-auth");

  if (token != x_auth) {
    res.sendStatus(401);
  } else {
    next();
  }
};

module.exports = auth;
