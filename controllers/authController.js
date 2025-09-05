import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username }); // ✅ mongoose
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      name,
      password: hashedPassword,
    });

    await user.save(); // ✅ mongoose save()

    return res.status(201).json({
      success: true,
      message: "User created",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ username }); // ✅ mongoose
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Username not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong Password",
      });
    }

    const access_token = jwt.sign(
      { userId: user._id }, // ✅ mongoose _id
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true, // ⚠️ only works with HTTPS in dev, might cause cookie not set on localhost
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
