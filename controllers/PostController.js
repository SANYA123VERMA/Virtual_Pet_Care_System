const Post = require("../models/postModel");
const User = require("../models/userModel");

module.exports = {
    // Create a new post
    createPost: async (req, res) => {
        console.log("Create Post Request Recieved");
        try {
            const { petName, ownerName, caption, category, tags } = req.body;
            console.log("Body:", req.body);
            let imagePath = "";
            let mediaType = "image";

            if (req.file) {
                console.log("File detected:", req.file.filename);
                imagePath = "/images/" + req.file.filename;
                if (req.file.mimetype.startsWith("video")) {
                    mediaType = "video";
                }
            } else {
                console.log("No file detected");
            }

            const newPost = new Post({
                petName,
                ownerName,
                ownerId: req.user,
                image: imagePath,
                mediaType,
                caption,
                category,
                tags: tags ? JSON.parse(tags) : [],
            });

            console.log("Saving post:", newPost);
            await newPost.save();
            console.log("Post saved successfully");
            res.json(newPost);
        } catch (err) {
            console.log("Create Post Error:", err);
            res.status(500).json({ msg: err.message });
        }
    },

    // Get all posts
    getAllPosts: async (req, res) => {
        try {
            const posts = await Post.find().sort({ createdAt: -1 });
            res.json(posts);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Get posts by category
    getPostsByCategory: async (req, res) => {
        try {
            const { cat } = req.params;
            let query = {};
            if (cat !== "All") {
                query = { category: cat };
            }
            const posts = await Post.find(query).sort({ createdAt: -1 });
            res.json(posts);
        } catch (err) {
            res.status(500).json({ status: "error", msg: err.message });
        }
    },

    // Get posts by specific user (for Profile)
    getPostsByUser: async (req, res) => {
        try {
            const userId = req.params.id;
            // Prevent crash on invalid IDs (like "undefined")
            if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.json([]); // Return empty if invalid ID
            }

            const posts = await Post.find({ ownerId: userId }).sort({ createdAt: -1 });
            res.json(posts);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: err.message });
        }
    },

    // Delete Post (Only Owner)
    // Delete Post (Only Owner)
    deletePost: async (req, res) => {
        try {
            console.log("Attempting to delete post:", req.params.id);
            const post = await Post.findById(req.params.id);
            if (!post) {
                console.log("Post not found");
                return res.status(404).json({ msg: "Post not found" });
            }

            console.log("Post Owner:", post.ownerId, "Request User:", req.user);

            // Robust check: Handle cases where ownerId might be missing (legacy posts)
            const postOwnerId = post.ownerId ? post.ownerId.toString() : null;

            if (postOwnerId !== req.user) {
                console.log("Unauthorized deletion attempt");
                return res.status(401).json({ msg: "Not authorized to delete this post" });
            }

            await Post.findByIdAndDelete(req.params.id);
            console.log("Post deleted successfully");
            res.json({ msg: "Post deleted" });
        } catch (err) {
            console.error("Delete Error:", err);
            res.status(500).json({ msg: err.message });
        }
    },

    // Add Comment
    addComment: async (req, res) => {
        try {
            const { text, userName } = req.body;
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ msg: "Post not found" });

            const newComment = {
                text,
                userName,
                ownerId: req.user,
            };

            post.comments.push(newComment);
            await post.save();
            res.json(post);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Repost
    repost: async (req, res) => {
        try {
            const { caption } = req.body;
            const originalPost = await Post.findById(req.params.id);
            if (!originalPost) return res.status(404).json({ msg: "Original post not found" });

            // Fetch current user to get name
            const currentUser = await User.findById(req.user);

            const newPost = new Post({
                petName: originalPost.petName, // Keep original pet name? Or allow changing? Logic says "Repost" keeps source.
                ownerName: currentUser.displayName, // Set to CURRENT user
                ownerId: req.user,
                image: originalPost.image,
                caption: caption || originalPost.caption,
                category: originalPost.category,
                repostFrom: originalPost.ownerName, // Credit original author
                tags: originalPost.tags,
                likedBy: []
            });

            await newPost.save();
            res.json(newPost);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: err.message });
        }
    },

    // Like a post (Toggle)
    likePost: async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ msg: "Post not found" });

            const userId = req.user;

            if (post.likedBy.includes(userId)) {
                // Unlike
                post.likedBy = post.likedBy.filter(id => id !== userId);
            } else {
                // Like
                post.likedBy.push(userId);
            }

            await post.save();
            res.json(post);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },
};
