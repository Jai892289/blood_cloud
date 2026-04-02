import { db } from "../db/index.js";
import { blood_group_master } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

/* ------------------------------------
   CREATE BLOOD GROUP
------------------------------------ */
export const createBloodGroup = async (req, res) => {
  try {
    const { group_name, is_active = true } = req.body;

    if (!group_name) {
      return res.status(400).json({ message: "group_name is required." });
    }

    // Check if already exists
    const exists = await db
      .select()
      .from(blood_group_master)
      .where(eq(blood_group_master.group_name, group_name));

    if (exists.length > 0) {
      return res.status(400).json({ message: "Blood group already exists." });
    }

    const result = await db
      .insert(blood_group_master)
      .values({ group_name, is_active })
      .returning();

    return res.status(201).json({
      message: "Blood group created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("createBloodGroup Error:", error);
    return res.status(500).json({
      message: "Failed to create blood group",
      error: error.message,
    });
  }
};

/* ------------------------------------
   GET ALL BLOOD GROUPS
------------------------------------ */
export const getAllBloodGroups = async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(blood_group_master)
      .orderBy(desc(blood_group_master.id));

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("getAllBloodGroups Error:", error);
    return res.status(500).json({
      message: "Failed to fetch blood groups",
      error: error.message,
    });
  }
};
/* ------------------------------------
   GET BLOOD GROUP BY ID
------------------------------------ */
export const getBloodGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select()
      .from(blood_group_master)
      .where(eq(blood_group_master.id, Number(id)));

    if (rows.length === 0) {
      return res.status(404).json({ message: "Blood group not found." });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("getBloodGroupById Error:", error);
    return res.status(500).json({
      message: "Failed to fetch blood group",
      error: error.message,
    });
  }
};

/* ------------------------------------
   UPDATE BLOOD GROUP
------------------------------------ */
export const updateBloodGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, is_active } = req.body;

    const result = await db
      .update(blood_group_master)
      .set({
        ...(group_name !== undefined && { group_name }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
      })
      .where(eq(blood_group_master.id, Number(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Blood group not found." });
    }

    return res.status(200).json({
      message: "Blood group updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("updateBloodGroup Error:", error);
    return res.status(500).json({
      message: "Failed to update blood group",
      error: error.message,
    });
  }
};

/* ------------------------------------
   DELETE BLOOD GROUP
------------------------------------ */
export const deleteBloodGroup = async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .delete(blood_group_master)
      .where(eq(blood_group_master.id, Number(id)));

    return res.status(200).json({
      message: "Blood group deleted successfully",
    });
  } catch (error) {
    console.error("deleteBloodGroup Error:", error);
    return res.status(500).json({
      message: "Failed to delete blood group",
      error: error.message,
    });
  }
};
