const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of 2 user IDs
    lastMessage: { type: String },
    lastMessageDate: { type: Date, default: Date.now },
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
