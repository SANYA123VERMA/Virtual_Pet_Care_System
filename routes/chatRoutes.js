const router = require("express").Router();
const auth = require("../middleware/auth");
const { initiateChat, getUserChats, getChatById, addMessage, deleteChat, markChatRead } = require("../controllers/ChatController");

router.post("/initiate", auth, initiateChat);
router.get("/", auth, getUserChats);
router.get("/:id", auth, getChatById);
router.post("/message/:id", auth, addMessage);
router.delete("/:chatId", auth, deleteChat);
router.put("/read/:chatId", auth, markChatRead);

module.exports = router;
