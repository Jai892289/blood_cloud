import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.post("/", verifyToken, isAdmin, createUser);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
