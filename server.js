const express = require("express");
const http = require("http");
const db_connection = require("./database");
const router = require("./route/routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
require("dotenv").config();
const socketHelper = require("./socket");
const { postWebhook } = require("./contoller/addController");

const PORT = process.env.PORT || 8080;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

socketHelper.init(io);

db_connection();

app.use(cors());
app.post("/webhook", bodyParser.raw({ type: "application/json" }), postWebhook);

app.use(express.json());
app.use("/", router);



io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
