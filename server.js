const express = require("express");
const http = require("http");
const db_connection = require("./database");
const router = require("./route/routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const order = require("./model/order");
const { Server } = require("socket.io");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const socketHelper = require("./socket");

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
app.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.WHSEC;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("✅ Payment succeeded:", paymentIntent.id);

    try {
      const userdata = await order.findOne({ paymentIntentId: paymentIntent.id });

      if (!userdata) {
        console.log("❌ Payment ID not found in order DB");
      } else {
        userdata.paymentStatus = "paid";
        await userdata.save();
        console.log("✅ Order updated to 'paid'");

        io.emit("paymentStatusUpdate", {
          orderId: userdata._id,
          status: "paid",
        });
      }
    } catch (dbErr) {
      console.error("❌ Error updating order in DB:", dbErr);
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use("/", router);



io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
