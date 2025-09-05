import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function attachSocketAuth(socket) {
  socket.use(async (packet, next) => {
    const [eventName] = packet;

    const protectedEvents = ["create_a_quiz"];
    if (!protectedEvents.includes(eventName)) return next();

    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        socket.emit("auth_error", "No cookies found");
        return next(new Error("No cookies found"));
      }

      const cookies = cookie.parse(rawCookie);
      if (!cookies.access_token) {
        socket.emit("auth_error", "Access Token not found");
        return next(new Error("Access Token not found"));
      }

      const decoded = jwt.verify(cookies.access_token, process.env.JWT_SECRET);
      if (!decoded) {
        socket.emit("auth_error", "Invalid token");
        return next(new Error("Invalid token"));
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        socket.emit("auth_error", "User not found");
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Authentication error:", err.message);
      socket.emit("auth_error", err.message);
      return next(new Error("Authentication error"));
    }
  });
}
