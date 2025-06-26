const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
      unique: true,
    },
    image: {
      type: String,
      required: [true, "product image is required"],
      unique: true,
    },
    gender: {
      type: String,
      required: [true, "product gender is required"],
    },
    price: {
      type: Number,
      required: [true, "product Price is required"],
      unique: true,
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
