import dotenv from "dotenv";

dotenv.config();

export default {
  x_auth: process.env.X_AUTH,
  PORT: process.env.PORT,
};
