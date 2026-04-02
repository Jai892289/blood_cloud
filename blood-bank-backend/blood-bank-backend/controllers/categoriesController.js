import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllCategories = async (req, res) => {
  try {
    const data = await db.select().from(categories);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const data = await db.select().from(categories).where(eq(categories.id, req.params.id));
    res.json(data[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const result = await db.insert(categories).values(req.body).returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const result = await db
      .update(categories)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(categories.id, req.params.id))
      .returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await db.delete(categories).where(eq(categories.id, req.params.id));
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
