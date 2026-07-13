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
  process.env.CLIENT_URL,
].filter(Boolean);

// ======================
// CORS
// ======================

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
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

    const users = Array.from(
      onlineUsers.values()
    ).map((u) => u.user);

    io.emit("users:online", users);
  });

  // Message Seen

  socket.on(
    "message:seen",
    ({ senderId, conversationId }) => {
      const sender =
        onlineUsers.get(senderId);

      if (sender) {
        io.to(sender.socketId).emit(
          "message:seen",
          {
            conversationId,
          }
        );
      }
    }
  );

  // Typing Start

  socket.on(
    "typing:start",
    ({ receiverId, senderName }) => {
      const receiver =
        onlineUsers.get(receiverId);

      if (receiver) {
        io.to(receiver.socketId).emit(
          "typing:start",
          {
            senderName,
          }
        );
      }
    }
  );

  // Typing Stop

  socket.on(
    "typing:stop",
    ({ receiverId }) => {
      const receiver =
        onlineUsers.get(receiverId);

      if (receiver) {
        io.to(receiver.socketId).emit(
          "typing:stop"
        );
      }
    }
  );

  // Disconnect

  socket.on("disconnect", () => {
    for (const [
      userId,
      value,
    ] of onlineUsers.entries()) {
      if (
        value.socketId === socket.id
      ) {
        onlineUsers.delete(userId);
        break;
      }
    }

    const users = Array.from(
      onlineUsers.values()
    ).map((u) => u.user);

    io.emit("users:online", users);

    console.log(
      "User disconnected:",
      socket.id
    );
  });
});

// ======================
// Routes
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
  res.status(200).json({
    success: true,
    message: "StudentSphere Backend Running 🚀",
  });
});

// ======================
// Server
// ======================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});