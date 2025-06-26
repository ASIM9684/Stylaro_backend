const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: { type: String },
  image: { type: String }
}, { timestamps: true }); 

module.exports = mongoose.model("User", userSchema);
