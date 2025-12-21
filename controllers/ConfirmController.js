const Confirm = require("../models/confirmModel");
const User = require("../models/userModel");

module.exports = {
  confirmUser: async (req, res) => {
    try {
      const token = req.params.token;

      const confirmation = await Confirm.findOne({ token });
      if (!confirmation) return res.status(400).send("Invalid or expired token");

      const user = await User.findById(confirmation.userID);
      if (!user) return res.status(400).send("User not found");

      user.confirmed = true;
      await user.save();
      await Confirm.deleteOne({ token });

      res.send("<h2>Your email has been verified successfully!</h2>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  },
};
