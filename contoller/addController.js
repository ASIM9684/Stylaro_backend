const category = require("../model/category");
const color = require("../model/color");
const complain = require("../model/complain");
const favorites = require("../model/favorites");
const order = require("../model/order");
const product = require("../model/product");
const Product = require("../model/product");
const user = require("../model/user");
const { getIO } = require("../socket");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const addProduct = async (req, res) => {
  try {
    const { name, price, image, category, color, gender, discount, quantity, rating } = req.body;
    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Product({
      name,
      price,
      image,
      category,
      color,
      gender,
      discount,
      quantity,
      rating
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await category.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Category already Exist" });
    }
    const addCategory = new category({
      name,
    });
    await addCategory.save();
    return res.status(201).json({ message: "Category added Successfully" });
  } catch (error) {
    console.log("Error Adding category:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const addColor = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await color.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Color already Exist" });
    }
    const addColor = new color({
      name,
    });
    await addColor.save();
    return res.status(201).json({ message: "Color added Successfully" });
  } catch (error) {
    console.log("Error Adding Color:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addComplain = async (req, res) => {
  try {
    const { subject, message } = req.body;


    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required." });
    }

    const newComplain = new complain({
      subject,
      message,
      userId: req.user._id,
    });

    await newComplain.save();
    return res
      .status(201)
      .json({ message: "Your complaint has been received" });
  } catch (error) {
    console.error("Add Complain Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;
  try {
    const exists = await favorites.findOne({ userId, productId });
    if (!exists) {
      await favorites.create({ userId, productId });
    }
    res.status(200).json({ success: true, message: "Favorite Added Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" }); e
  }
};

const orderproduct = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user._id;

    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { userId: userId.toString() },
    });

    const newOrder = new order({
      userId,
      items: items.map(({ _id, quantity, price }) => ({
        productId: _id,
        quantity,
        price,
      })),
      address,
      totalAmount,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
    });

    await newOrder.save();

 getIO().emit("newOrderCreated", {
  orderId: newOrder._id,
  totalAmount,
  createdAt: newOrder.createdAt,
});

    await user.findByIdAndUpdate(userId, {
      status: "verified",
      isVerified: true,
    });

    for (const { _id, quantity } of items) {
      const qty = parseInt(quantity);
      if (!isNaN(qty)) {
        await product.findByIdAndUpdate(_id, {
          $inc: { quantity: -qty }, // Decrement stock
        });
      }
    }


    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
};


module.exports = { addProduct, addCategory, addColor, addComplain, addFavorite, orderproduct };
