const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to user model
    image: { type: String }, // Local path to image or video
    mediaType: { type: String, default: "image" }, // 'image' or 'video'
    caption: { type: String },
    likedBy: { type: [String], default: [] }, // Array of user IDs who liked the post
    category: { type: String, default: "All" },
    tags: { type: [String], default: [] },
    comments: [
        {
            text: String,
            userName: String,
            ownerId: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    repostFrom: { type: String }, // Original owner name if reposted
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("post", postSchema);
