import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const data = await db.select().from(users);
    res.json({ message: "Users fetched successfully", data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ Get user by ID
export const getUserById = async (req, res) => {
  try {
    const data = await db.select().from(users).where(eq(users.id, req.params.id));
    res.json({
      message: data.length ? "User fetched successfully" : "User not found",
      data: data[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

// ✅ Create user
export const createUser = async (req, res) => {
  try {
    const result = await db.insert(users).values(req.body).returning();
    res.status(201).json({ message: "User created successfully", data: result[0] });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// ✅ Update user
export const updateUser = async (req, res) => {
  try {
    const result = await db
      .update(users)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(users.id, req.params.id))
      .returning();
    res.json({
      message: result.length ? "User updated successfully" : "User not found",
      data: result[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ message: "User deleted successfully", data: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
