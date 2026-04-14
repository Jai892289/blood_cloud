import express from "express"
import { createHospital, deleteHospital, getAllHospitals, getHospitalById, updateHospital } from "../controllers/hospitalController.js";
const router = express.Router()



router.get("/hospitals", getAllHospitals);
router.get("/hospitals/:id", getHospitalById);
router.post("/hospitals", createHospital);
router.put("/hospitals/:id", updateHospital);
router.delete("/hospitals/:id", deleteHospital);



export default router










