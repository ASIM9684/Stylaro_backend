const mongoose = require("mongoose");
require("dotenv").config();

const db_connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

module.exports = db_connection;