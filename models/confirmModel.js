const mongoose = require("mongoose");

const confirmSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // reference to User
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // token expires in 1 hour
});

module.exports = mongoose.model("Confirm", confirmSchema);
