const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: String, // Can be used when user is logged in
        required: false,
    },
    endpoint: {
        type: String,
        required: true,
        unique: true,
    },
    keys: {
        p256dh: String,
        auth: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = Subscription = mongoose.model("subscription", subscriptionSchema);
