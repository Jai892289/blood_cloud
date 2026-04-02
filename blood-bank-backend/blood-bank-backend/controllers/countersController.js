import { db } from "../db/index.js";
import { counters } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

export const createCounter = async (req, res) => {
  try {
    const { counter_name, location, is_active = true } = req.body;
    if (!counter_name || !location) {
      return res.status(400).json({ message: "counter_name and location required" });
    }

    const result = await db.insert(counters).values({ counter_name, location, is_active }).returning();
    return res.status(201).json({ message: "Counter created", data: result[0] });
  } catch (error) {
    console.error("createCounter:", error);
    return res.status(500).json({ message: "Failed to create counter", error: error.message });
  }
};

export const getAllCounters = async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(counters)
      .orderBy(desc(counters.id));

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("getAllCounters:", error);
    return res.status(500).json({
      message: "Failed to fetch counters",
      error: error.message,
    });
  }
};

export const getCounterById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.select().from(counters).where(eq(counters.id, Number(id)));
    if (rows.length === 0) return res.status(404).json({ message: "Counter not found" });
    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("getCounterById:", error);
    return res.status(500).json({ message: "Failed to fetch counter", error: error.message });
  }
};

export const updateCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const { counter_name, location, is_active } = req.body;
    const result = await db
      .update(counters)
      .set({
        ...(counter_name !== undefined && { counter_name }),
        ...(location !== undefined && { location }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
      })
      .where(eq(counters.id, Number(id)))
      .returning();

    if (!result.length) return res.status(404).json({ message: "Counter not found" });
    return res.status(200).json({ message: "Counter updated", data: result[0] });
  } catch (error) {
    console.error("updateCounter:", error);
    return res.status(500).json({ message: "Failed to update counter", error: error.message });
  }
};

export const deleteCounter = async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(counters).where(eq(counters.id, Number(id)));
    return res.status(200).json({ message: "Counter deleted" });
  } catch (error) {
    console.error("deleteCounter:", error);
    return res.status(500).json({ message: "Failed to delete counter", error: error.message });
  }
};
