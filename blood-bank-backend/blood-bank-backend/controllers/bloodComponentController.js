import { db } from "../db/index.js";
import { blood_component_master } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

export const createComponent = async (req, res) => {
  try {
    const { component_name, description, is_active = true } = req.body;
    if (!component_name) return res.status(400).json({ message: "component_name required" });

    const existing = await db.select().from(blood_component_master).where(eq(blood_component_master.component_name, component_name));
    if (existing.length) return res.status(400).json({ message: "Component already exists" });

    const result = await db.insert(blood_component_master).values({ component_name, description, is_active }).returning();
    return res.status(201).json({ message: "Component created", data: result[0] });
  } catch (error) {
    console.error("createComponent:", error);
    return res.status(500).json({ message: "Failed to create component", error: error.message });
  }
};

export const getAllComponents = async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(blood_component_master)
      .orderBy(desc(blood_component_master.id));

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("getAllComponents:", error);
    return res.status(500).json({
      message: "Failed to fetch components",
      error: error.message,
    });
  }
};

export const getComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.select().from(blood_component_master).where(eq(blood_component_master.id, Number(id)));
    if (!rows.length) return res.status(404).json({ message: "Component not found" });
    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("getComponentById:", error);
    return res.status(500).json({ message: "Failed to fetch component", error: error.message });
  }
};

export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { component_name, description, is_active } = req.body;

    const result = await db
      .update(blood_component_master)
      .set({
        ...(component_name !== undefined && { component_name }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
      })
      .where(eq(blood_component_master.id, Number(id)))
      .returning();

    if (!result.length) return res.status(404).json({ message: "Component not found" });
    return res.status(200).json({ message: "Component updated", data: result[0] });
  } catch (error) {
    console.error("updateComponent:", error);
    return res.status(500).json({ message: "Failed to update component", error: error.message });
  }
};

export const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(blood_component_master).where(eq(blood_component_master.id, Number(id)));
    return res.status(200).json({ message: "Component deleted" });
  } catch (error) {
    console.error("deleteComponent:", error);
    return res.status(500).json({ message: "Failed to delete component", error: error.message });
  }
};
