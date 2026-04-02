import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

/**
 * @route POST /api/auth/register
 * @desc Register a new user (Admin or Counter)
 */
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, counter_location, role } = req.body;

    // Allow only Admin and Counter roles
    if (!["Admin", "Counter"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Only Admin or Counter are allowed.",
      });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await db
      .insert(users)
      .values({
        full_name,
        email,
        password: hashedPassword,
        counter_location,
        status: true,
        role,
      })
      .returning();

    const user = result[0];

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register user",
      error: error.message,
    });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user (Admin or Counter)
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    // ❌ If no user found, show a single generic message
    if (existingUser.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = existingUser[0];

    // Check if account is active
    if (!user.status) {
      return res.status(403).json({ message: "User account is inactive. Please contact admin." });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          counter_location: user.counter_location,
           status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Something went wrong during login.",
      error: error.message,
    });
  }
};
