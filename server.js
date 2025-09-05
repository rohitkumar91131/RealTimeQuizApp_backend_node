import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import quizSocketEvennts from './sockets/quizEvents.js'

dotenv.config();

const PORT = process.env.PORT || 3000;
console.log(process.env.FRONTEND_URL)
const server = http.createServer(app);
import sequelize from "./config/db.js";
import User from "./models/User.js";
import { attachSocketAuth } from "./middleware/socketauthmiddleware.js";


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials : true
  },
});


io.on("connection", (socket) => {
  const ip = socket.handshake.address || socket.request?.connection?.remoteAddress;
  const origin = socket.handshake.headers.origin || socket.handshake.headers.referer;
  console.log("⚡ New client connected:", socket.id, { ip, origin, ua: socket.handshake.headers["user-agent"] });


  attachSocketAuth(socket );
  quizSocketEvennts(io , socket )

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });


  
});


await connectDB();


server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
