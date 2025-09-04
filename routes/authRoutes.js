import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {signup , login} from '../controllers/authController.js';

const router = Router();


router.post("/signup",signup);
router.post("/login", login);

export default router;
