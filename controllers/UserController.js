require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Confirm = require("../models/confirmModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports = {
  // ================= REGISTER =================
  register: async (req, res) => {
    try {
      const { email, password, passwordCheck, firstName, lastName } = req.body;

      if (!email || !password || !passwordCheck || !firstName)
        return res.status(400).json({ msg: "All fields are required (except last name)" });

      if (password !== passwordCheck)
        return res.status(400).json({ msg: "Passwords do not match" });

      if (password.length < 8)
        return res.status(400).json({ msg: "Password must be at least 8 chars" });

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Register Failed: User already exists");
        return res.status(400).json({ msg: "User already exists" });
      }

      const displayName = lastName ? `${firstName} ${lastName}` : firstName;

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        password: passwordHash,
        displayName,
        confirmed: false, // Strict verification: false by default
      });

      await newUser.save();

      // Create confirmation token
      const token = new Confirm({
        userID: newUser._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      await token.save();

      // Send Verification Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const url = `http://localhost:5000/confirm/verify/${token.token}`;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Verify your Account",
        html: `<h3>Click the link to verify your account: <a href="${url}">Verify Email</a></h3>`,
      });

      res.status(201).json({
        msg: "Registration successful! Please check your email to verify your account.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= LOGIN =================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ msg: "All fields required" });

      const user = await User.findOne({ email });
      if (!user) {
        console.log("Login Failed: User not found");
        return res.status(400).json({ msg: "User not found" });
      }

      if (!user.confirmed) {
        console.log("Login Failed: User not confirmed");
        return res.status(400).json({ msg: "Please verify your email before logging in." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Login Failed: Password mismatch");
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

      res.json({
        token,
        user: {
          id: user._id,
          _id: user._id, // Ensure _id is available immediately after login
          displayName: user.displayName,
          email: user.email,
          confirmed: true,
        },
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= GET USER =================
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ msg: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= DELETE USER =================
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      res.json({ msg: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= FORGOT PASSWORD =================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User with this email does not exist" });

      const token = new Confirm({
        userID: user._id,
        token: crypto.randomBytes(20).toString("hex"),
      });
      await token.save();



      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      // Point to frontend reset page
      const url = `http://localhost:3000/reset-password/${token.token}`;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Reset Password",
        html: `<h3>Click the link to reset your password: <a href="${url}">Reset Password</a></h3>`,
      });

      res.json({ msg: "Password reset link sent to your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= RESET PASSWORD =================
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword)
        return res.status(400).json({ msg: "Passwords do not match" });

      const confirmToken = await Confirm.findOne({ token });
      if (!confirmToken) return res.status(400).json({ msg: "Invalid or expired token" });

      const user = await User.findById(confirmToken.userID);
      if (!user) return res.status(400).json({ msg: "User not found" });

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      await Confirm.deleteOne({ token });

      res.json({ msg: "Password reset successfully. You can now login." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

