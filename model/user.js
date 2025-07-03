const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    password: { type: String, required: true },
    address: String,
    image: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,

    status: {
      type: String,
      enum: ["unverified", "verified", "banned"],
      default: "unverified",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
