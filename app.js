import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser'
const app = express();


app.use(cors());
  
app.use(cookieParser())
app.use(express.json());

app.get("/",(req,res)=>{
  res.json({
    success : true,
    msg : "Backend Connected"
  })
})
app.use("/auth", authRoutes);
app.use("/user",userRoutes);

export default app;
