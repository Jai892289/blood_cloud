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
  cancelBilling,
  initBilling,
  getByReference,
  getReferenceList,
} from "../controllers/billingsController.js";

const router = express.Router();

router.get("/last-billno-serial", getLastBillNoSerial);
router.get("/latest", getAllLatestBillings);
router.get("/by-mobile/:mobile", getPatientByMobile);

router.post("/init", initBilling);
router.get("/ref/:refId", getByReference);


router.get("/references", getReferenceList);


router.get("/test", (req, res) => {
  res.send("billing route working");
});


router.get("/", getAllBillings);
router.get("/:id", getBillingById);
router.post("/", createBilling);
router.put("/:id", updateBilling);
router.delete("/:id", deleteBilling);
router.put("/:id/cancel", cancelBilling);



export default router;
