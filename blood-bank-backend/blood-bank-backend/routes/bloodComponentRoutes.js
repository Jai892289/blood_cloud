import express from "express";
import * as compCtrl from "../controllers/bloodComponentController.js";

const router = express.Router();

router.post("/", compCtrl.createComponent);
router.get("/", compCtrl.getAllComponents);
router.get("/:id", compCtrl.getComponentById);
router.put("/:id", compCtrl.updateComponent);
router.delete("/:id", compCtrl.deleteComponent);

export default router;
