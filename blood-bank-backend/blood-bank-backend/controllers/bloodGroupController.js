import { db } from "../db/index.js";
import { blood_group } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllBloodGroups = async (req, res) => {
  try {
    const data = await db.select().from(blood_group);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBloodGroupById = async (req, res) => {
  try {
    const data = await db.select().from(blood_group).where(eq(blood_group.id, req.params.id));
    res.json(data[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBloodGroup = async (req, res) => {
  try {
    const result = await db.insert(blood_group).values(req.body).returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBloodGroup = async (req, res) => {
  try {
    const result = await db
      .update(blood_group)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(blood_group.id, req.params.id))
      .returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBloodGroup = async (req, res) => {
  try {
    await db.delete(blood_group).where(eq(blood_group.id, req.params.id));
    res.json({ message: "Blood group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
