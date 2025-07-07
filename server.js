const express = require("express");
const db_connection = require("./database");
const router = require("./route/routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const order = require("./model/order");
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
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
      }
    } catch (dbErr) {
      console.error("❌ Error updating order in DB:", dbErr);
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use("/", router);

app.listen(8000, () => {
  console.log("🚀 Server running on http://localhost:8000");
});
