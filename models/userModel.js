const mongoose = require("mongoose");
const Pets = require("./pets");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Enter a valid email"],
  },
  password: { type: String, required: true, minLength: 5 },
  displayName: { type: String, required: true },
  confirmed: { type: Boolean, default: false }, // for email verification
});

// Delete all pets of this user when the user is removed
userSchema.pre("remove", async function (next) {
  try {
    await Pets.deleteMany({ ParentID: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
