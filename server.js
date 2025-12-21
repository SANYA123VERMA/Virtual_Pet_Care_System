const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
console.log("DEBUG: MAIL_USER is", process.env.MAIL_USER ? "LOADED" : "MISSING");
console.log("DEBUG: MAIL_PASS is", process.env.MAIL_PASS ? "LOADED" : "MISSING");

require("./models/mongoConnection"); // your MongoDB connection

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("dev"));

// Routes
app.use("/users", require("./routes/userRoutes"));        // Register + login + CRUD
app.use("/confirm", require("./routes/confirmRoutes"));  // Email verification
app.use("/api", require("./routes/petRoutes"));          // Pets and related data
app.use("/api", require("./routes/imgLocRoutes"));       // Local image upload
// Serve static images for notifications
app.use("/images", express.static(path.join(__dirname, "client/public/images")));
app.use("/api", require("./routes/pushRoutes"));         // Push subscriptions
app.use("/posts", require("./routes/postRoutes"));       // Community Feed

// Start Scheduler
const { startScheduler } = require("./cron/scheduler");
startScheduler();

// Optional root route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Safety: Redirect mistakes to frontend
app.get(['/profile/*', '/community', '/login', '/register', '/home'], (req, res) => {
  res.redirect(`http://localhost:3000${req.originalUrl}`);
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.use("/chats", require("./routes/chatRoutes"));

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000" }
});

const Chat = require("./models/chatModel");

io.on("connection", (socket) => {
  console.log("Connected to socket.io:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    // data: { roomId, senderId, text }
    console.log("Message received:", data);
    const { roomId, senderId, text } = data;

    // Save to DB
    try {
      const chat = await Chat.findById(roomId);
      if (chat) {
        const newMessage = {
          sender: senderId,
          text,
          createdAt: new Date()
        };
        chat.messages.push(newMessage);
        chat.lastMessage = text;
        chat.lastMessageDate = new Date();

        // Unread Count Logic
        if (!chat.unreadCounts) chat.unreadCounts = new Map();

        chat.participants.forEach(userId => {
          if (userId.toString() !== senderId) {
            // Increment unread for others
            const current = chat.unreadCounts.get(userId.toString()) || 0;
            chat.unreadCounts.set(userId.toString(), current + 1);

            // Emit Notification to their personal room
            io.to(userId.toString()).emit("notification", {
              chatId: roomId,
              senderId: senderId,
              text: text
            });
          }
        });

        await chat.save();

        // Broadcast to Chat Room
        io.to(roomId).emit("receive_message", newMessage);
      }
    } catch (err) {
      console.error("Socket Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Start server
// Start server
server.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
