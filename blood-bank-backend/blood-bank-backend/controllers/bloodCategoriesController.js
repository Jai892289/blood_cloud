import { db } from "../db/index.js";
import { blood_categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllBloodCategories = async (req, res) => {
  try {
    const data = await db.select().from(blood_categories);
    res.json({ message: "Blood categories fetched successfully", data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blood categories", error: err.message });
  }
};

export const getBloodCategoryById = async (req, res) => {
  try {
    const data = await db.select().from(blood_categories).where(eq(blood_categories.id, req.params.id));
    res.json({
      message: data.length ? "Blood category fetched successfully" : "Blood category not found",
      data: data[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blood category", error: err.message });
  }
};

export const createBloodCategory = async (req, res) => {
  try {
    const body = {
      ...req.body,
      cross_match: req.body.cross_match ?? 0, // default
    };

    const result = await db.insert(blood_categories).values(body).returning();
    res.status(201).json({ message: "Blood category created successfully", data: result[0] });
  } catch (err) {
    res.status(500).json({ message: "Failed to create blood category", error: err.message });
  }
};


export const updateBloodCategory = async (req, res) => {
  try {
    const body = {
      ...req.body,
      cross_match: req.body.cross_match ?? 0,
      updated_at: new Date(),
    };

    const result = await db
      .update(blood_categories)
      .set(body)
      .where(eq(blood_categories.id, req.params.id))
      .returning();

    res.json({
      message: result.length ? "Blood category updated successfully" : "Blood category not found",
      data: result[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update blood category", error: err.message });
  }
};


export const deleteBloodCategory = async (req, res) => {
  try {
    await db.delete(blood_categories).where(eq(blood_categories.id, req.params.id));
    res.json({ message: "Blood category deleted successfully", data: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blood category", error: err.message });
  }
};
