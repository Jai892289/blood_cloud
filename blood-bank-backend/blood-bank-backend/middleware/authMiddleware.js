import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Verify JWT Token
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    req.user = decoded; // attach user data to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token", error: error.message });
  }
};

/**
 * Allow access only to Admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};

/**
 * Allow access to Counter role or Admin
 */
export const isCounterOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  if (req.user.role !== "Admin" && req.user.role !== "Counter") {
    return res.status(403).json({ message: "Access denied. Only Admin or Counter users allowed." });
  }

  next();
};
