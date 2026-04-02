import express from "express";
import * as countersCtrl from "../controllers/countersController.js";

const router = express.Router();

router.post("/", countersCtrl.createCounter);
router.get("/", countersCtrl.getAllCounters);
router.get("/:id", countersCtrl.getCounterById);
router.put("/:id", countersCtrl.updateCounter);
router.delete("/:id", countersCtrl.deleteCounter);

export default router;
