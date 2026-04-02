import express from "express";
import {
  getAllBloodCategories,
  getBloodCategoryById,
  createBloodCategory,
  updateBloodCategory,
  deleteBloodCategory,
} from "../controllers/bloodCategoriesController.js";

const router = express.Router();

router.get("/", getAllBloodCategories);
router.get("/:id", getBloodCategoryById);
router.post("/", createBloodCategory);
router.put("/:id", updateBloodCategory);
router.delete("/:id", deleteBloodCategory);

export default router;
