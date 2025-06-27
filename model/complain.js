const mongoose = require("mongoose");

const complainSchema = mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      ref: "user",
      type: mongoose.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("complain", complainSchema);
