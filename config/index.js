import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  x_auth: process.env.X_AUTH,
};
