import express from "express";
import {
  getAllBillings,
  getBillingById,
  createBilling,
  updateBilling,
  deleteBilling,
  getAllLatestBillings,
  getLastBillNoSerial,
  getPatientByMobile,
} from "../controllers/billingsController.js";

const router = express.Router();

router.get("/last-billno-serial", getLastBillNoSerial);
router.get("/latest", getAllLatestBillings);
router.get("/by-mobile/:mobile", getPatientByMobile);
router.get("/test", (req, res) => {
  res.send("billing route working");
});

router.get("/", getAllBillings);
router.get("/:id", getBillingById);
router.post("/", createBilling);
router.put("/:id", updateBilling);
router.delete("/:id", deleteBilling);






export default router;
