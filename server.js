import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
import sequelize from "./config/db.js";
import User from "./models/User.js";

sequelize.sync({ alter: true }) 
.then(() => console.log("✅ Tables synced"))
.catch(err => console.error("❌ Table sync error:", err));


const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


await connectDB();


server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
