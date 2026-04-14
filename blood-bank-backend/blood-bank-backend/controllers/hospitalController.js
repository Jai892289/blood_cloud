import { db } from "../db/index.js";
import { hospitals } from "../db/schema.js";
import { eq } from "drizzle-orm";

/* -------------------- GET ALL -------------------- */
export const getAllHospitals = async (req, res) => {
  try {
    const data = await db.select().from(hospitals);
    res.json({ message: "Hospitals fetched successfully", data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hospitals", error: err.message });
  }
};

/* -------------------- GET BY ID -------------------- */
export const getHospitalById = async (req, res) => {
  try {
    const data = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, Number(req.params.id)));

    res.json({
      message: data.length ? "Hospital fetched successfully" : "Hospital not found",
      data: data[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hospital", error: err.message });
  }
};

/* -------------------- CREATE -------------------- */
export const createHospital = async (req, res) => {
  try {
    const body = {
      hospital_name: req.body.hospital_name,
      commission: req.body.commission ?? "0",
      serial_no: req.body.serial_no,
    };

    const result = await db.insert(hospitals).values(body).returning();

    res.status(201).json({
      message: "Hospital created successfully",
      data: result[0],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create hospital", error: err.message });
  }
};

/* -------------------- UPDATE -------------------- */
export const updateHospital = async (req, res) => {
  try {
    const body = {
      ...req.body,
      updated_at: new Date(),
    };

    const result = await db
      .update(hospitals)
      .set(body)
      .where(eq(hospitals.id, Number(req.params.id)))
      .returning();

    res.json({
      message: result.length ? "Hospital updated successfully" : "Hospital not found",
      data: result[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update hospital", error: err.message });
  }
};

/* -------------------- DELETE -------------------- */
export const deleteHospital = async (req, res) => {
  try {
    await db.delete(hospitals).where(eq(hospitals.id, Number(req.params.id)));

    res.json({ message: "Hospital deleted successfully", data: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete hospital", error: err.message });
  }
};