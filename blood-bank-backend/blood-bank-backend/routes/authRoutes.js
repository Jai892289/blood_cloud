import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Register first
router.post("/register", registerUser);

// Then login
router.post("/login", loginUser);

export default router;
