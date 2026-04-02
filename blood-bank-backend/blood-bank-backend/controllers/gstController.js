import { db } from "../db/index.js"
import { gst_percent } from "../db/schema.js"
import { eq } from "drizzle-orm"

// 🟢 Get the single GST record
export const getGST = async (req, res) => {
  try {
    const data = await db.select().from(gst_percent).limit(1)
    if (data.length === 0) {
      return res.json({
        message: "No GST record found",
        data: null,
      })
    }
    res.json({
      message: "GST record fetched successfully",
      data: data[0],
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch GST record",
      error: err.message,
    })
  }
}

// 🟢 Create GST record (only if none exists)
export const createGST = async (req, res) => {
  try {
    const existing = await db.select().from(gst_percent).limit(1)
    if (existing.length > 0) {
      return res.status(400).json({
        message: "GST record already exists. Use update instead.",
      })
    }

    const result = await db.insert(gst_percent).values({
      gst_percentage: req.body.gstPercentage,
      gst_enabled: req.body.gstEnabled,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning()

    res.status(201).json({
      message: "GST record created successfully",
      data: result[0],
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to create GST record",
      error: err.message,
    })
  }
}

// 🟢 Update GST (update the single record; create if missing)
export const updateGST = async (req, res) => {
  try {
    const existing = await db.select().from(gst_percent).limit(1)

    if (existing.length === 0) {
      // No record? Create it
      const result = await db.insert(gst_percent).values({
        gst_percentage: req.body.gstPercentage,
        gst_enabled: req.body.gstEnabled,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning()
      return res.status(201).json({
        message: "GST record created successfully (no prior record found)",
        data: result[0],
      })
    }

    // Record exists → update it
    const gstId = existing[0].id
    const result = await db.update(gst_percent)
      .set({
        gst_percentage: req.body.gstPercentage,
        gst_enabled: req.body.gstEnabled,
        updated_at: new Date(),
      })
      .where(eq(gst_percent.id, gstId))
      .returning()

    res.json({
      message: "GST record updated successfully",
      data: result[0],
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to update GST record",
      error: err.message,
    })
  }
}

// 🟡 Optional — Delete GST (not really needed for one-record config)
export const deleteGST = async (req, res) => {
  try {
    await db.delete(gst_percent)
    res.json({
      message: "GST record deleted successfully",
      data: null,
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete GST record",
      error: err.message,
    })
  }
}
