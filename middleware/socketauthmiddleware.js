import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function attachSocketAuth(socket) {
  socket.use(async (packet, next) => {
    const [eventName, data] = packet;

    const protectedEvents = ["create_a_quiz"];
    if (!protectedEvents.includes(eventName)) return next();
    console.log(protectedEvents)
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        console.log("No cookies found"); 
        socket.emit("auth_error", "No cookies found");
        return next(new Error("No cookies found"));
      }
    
      const cookies = cookie.parse(rawCookie);
      if(!cookies.access_token){
        socket.emit("auth_error" , "Access Token not found")
        return next(new Error("Access Token not found"))
      }
      const cookiesDecoded = jwt.verify(cookies.access_token, process.env.JWT_SECRET);
    
      if (!cookiesDecoded) {
        console.log("Token expired");
        socket.emit("auth_error", "Token expired");
        return next(new Error("Token expired"));
      }
    
      const user = await User.findByPk(cookiesDecoded.userId);
      if (!user) {
        console.log("User not found");
        socket.emit("auth_error", "User not found");
        return next(new Error("User not found"));
      }
    
      socket.user = user;
      next();
    } catch (err) {
      console.log("Unexpected error:", err);
      socket.emit("auth_error", err.message);
      return next(new Error("Authentication error"));
    }
    
  });
}
