import express from "express";
import * as bloodGroupMasterController from "../controllers/bloodGroupMasterController.js";

const router = express.Router();

// CREATE
router.post("/", bloodGroupMasterController.createBloodGroup);

// READ ALL
router.get("/", bloodGroupMasterController.getAllBloodGroups);

// READ BY ID
router.get("/:id", bloodGroupMasterController.getBloodGroupById);

// UPDATE
router.put("/:id", bloodGroupMasterController.updateBloodGroup);

// DELETE
router.delete("/:id", bloodGroupMasterController.deleteBloodGroup);

export default router;
