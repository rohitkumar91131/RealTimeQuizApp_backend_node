import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser'
const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  
app.use(cookieParser())
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/user",userRoutes);

export default app;
