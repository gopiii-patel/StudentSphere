require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const productRoutes = require("./routes/productRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const noteRoutes = require("./routes/noteRoutes");
const eventRoutes = require("./routes/eventRoutes");
const hostelRoutes = require("./routes/hostelRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

// ======================
// Allowed Origins
// ======================

const allowedOrigins = [
  "http://localhost:5173",
  "https://student-sphere-xi.vercel.app",
  "https://student-sphere-git-main-gopi4.vercel.app",
  "https://student-sphere-l8q0gkxa4-gopi4.vercel.app",
];

// ======================
// CORS
// ======================

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ======================
// Static Uploads
// ======================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================
// Socket.io
// ======================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

const onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);

// ======================
// Socket Events
// ======================

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("user:online", (userData) => {

    onlineUsers.set(userData._id, {
      socketId: socket.id,
      user: userData,
    });

    const users = Array.from(onlineUsers.values()).map((u) => u.user);

    io.emit("users:online", users);

  });

  socket.on("message:seen", ({ senderId, conversationId }) => {

    const sender = onlineUsers.get(senderId);

    if (sender) {
      io.to(sender.socketId).emit("message:seen", {
        conversationId,
      });
    }

  });

  socket.on("typing:start", ({ receiverId, senderName }) => {

    const receiver = onlineUsers.get(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("typing:start", {
        senderName,
      });
    }

  });

  socket.on("typing:stop", ({ receiverId }) => {

    const receiver = onlineUsers.get(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("typing:stop");
    }

  });

  socket.on("disconnect", () => {

    for (const [userId, value] of onlineUsers.entries()) {

      if (value.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }

    }

    const users = Array.from(onlineUsers.values()).map((u) => u.user);

    io.emit("users:online", users);

    console.log("User disconnected:", socket.id);

  });

});

// ======================
// API Routes
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/hostel", hostelRoutes);

// ======================
// Health Check
// ======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "StudentSphere Backend Running 🚀",
  });
});

// ======================
// Server
// ======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});