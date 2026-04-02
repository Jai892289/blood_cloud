import express from "express";
import {
  getAllBloodGroups,
  getBloodGroupById,
  createBloodGroup,
  updateBloodGroup,
  deleteBloodGroup,
} from "../controllers/bloodGroupController.js";

const router = express.Router();

router.get("/", getAllBloodGroups);
router.get("/:id", getBloodGroupById);
router.post("/", createBloodGroup);
router.put("/:id", updateBloodGroup);
router.delete("/:id", deleteBloodGroup);

export default router;
