const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/colllabboard",
  jwtSecret: process.env.JWT_SECRET || "change_me_in_env",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = env;
