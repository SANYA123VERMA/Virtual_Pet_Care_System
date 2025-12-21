const Chat = require("../models/chatModel");
const User = require("../models/userModel");

module.exports = {
    // Start or get existing chat
    initiateChat: async (req, res) => {
        try {
            const { targetUserId } = req.body;
            const myId = req.user;

            if (!targetUserId) return res.status(400).json({ msg: "Target User ID required" });

            // Check if chat exists
            let chat = await Chat.findOne({
                participants: { $all: [myId, targetUserId] }
            });

            if (!chat) {
                // Create new
                chat = new Chat({
                    participants: [myId, targetUserId],
                    messages: []
                });
                await chat.save();
            }

            res.json(chat);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Get all chats for current user (for Sidebar)
    getUserChats: async (req, res) => {
        try {
            const chats = await Chat.find({ participants: req.user })
                .populate("participants", "displayName image") // Get names/avatars
                .sort({ updatedAt: -1 });
            res.json(chats);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Get specific chat history
    getChatById: async (req, res) => {
        try {
            const chat = await Chat.findById(req.params.id)
                .populate("participants", "displayName");
            res.json(chat);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Add message (HTTP fallback, usually done via Socket)
    addMessage: async (req, res) => {
        try {
            const { text } = req.body;
            const chat = await Chat.findById(req.params.id);
            if (!chat) return res.status(404).json({ msg: "Chat not found" });

            const newMessage = {
                sender: req.user,
                text,
                createdAt: new Date()
            };

            chat.messages.push(newMessage);
            chat.lastMessage = text;
            chat.lastMessageDate = new Date();
            await chat.save();

            res.json(chat);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    // Delete Chat
    deleteChat: async (req, res) => {
        try {
            await Chat.findByIdAndDelete(req.params.chatId);
            res.status(200).json("Chat deleted");
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    markChatRead: async (req, res) => {
        try {
            const { chatId } = req.params;
            const chat = await Chat.findById(chatId);
            if (!chat) return res.status(404).json("Chat not found");

            const userId = req.user;
            if (!chat.unreadCounts) chat.unreadCounts = new Map();

            chat.unreadCounts.set(userId, 0); // Reset unread count for this user
            await chat.save();

            res.json(chat);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    }
};
