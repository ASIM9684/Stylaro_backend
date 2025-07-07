const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
      unique: true,
    },
    discount: {
      type: String
    },
    rating: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: [true, "product image is required"],
    },
    gender: {
      type: String,
      required: [true, "product gender is required"],
    },
    price: {
      type: Number,
      required: [true, "product Price is required"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
    },
    color: {
      type: mongoose.Types.ObjectId,
      ref: "color",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productSchema);
