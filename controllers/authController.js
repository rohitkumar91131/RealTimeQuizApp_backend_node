import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success : false,
        message: "Username already taken" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name,
      password: hashedPassword,
    });

    return res.status(201).json({ 
      success : true,
      message: "User created"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success : false,
      message: "Server error" 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password){
      return res.status(400).json({  
        success : false,
        message: "All fields are required" 
      });
    }  

    const user = await User.findOne({ 
      where: { username } 
    });
    if (!user) {
      return res.status(400).json({ 
        success : false,
        message: "Username not found" 
    });}

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong Password" 
      });
    }

    const access_token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,        
      secure: true,          
      sameSite: "None",      
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    return res.json({
      message: "Login successful",
      success : true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
