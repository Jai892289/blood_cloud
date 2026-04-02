import express from "express"
import { getGST, createGST, updateGST, deleteGST } from "../controllers/gstController.js"

const router = express.Router()

router.get("/", getGST)       // Get the single GST record
router.post("/", createGST)   // Create only if none exists
router.put("/", updateGST)    // Update the single record
router.delete("/", deleteGST) // Optional

export default router
