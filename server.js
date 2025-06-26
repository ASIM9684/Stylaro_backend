const express = require("express");
const db_connection = require("./database");
const router = require("./route/routes");
const cors = require("cors");

const app = express();

db_connection();

app.use(cors());
app.use(express.json());

app.use("/", router);

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
