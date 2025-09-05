import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import quizSocketEvents from "./sockets/quizEvents.js";
import { attachSocketAuth } from "./middleware/socketauthmiddleware.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const ip =
    socket.handshake.address ||
    socket.request?.connection?.remoteAddress;
  const origin =
    socket.handshake.headers.origin ||
    socket.handshake.headers.referer;
  console.log("⚡ New client connected:", socket.id, {
    ip,
    origin,
    ua: socket.handshake.headers["user-agent"],
  });

  attachSocketAuth(socket);
  quizSocketEvents(io, socket);

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });
});

await connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
