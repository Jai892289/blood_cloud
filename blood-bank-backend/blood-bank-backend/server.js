import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

import usersRoutes from "./routes/usersRoutes.js";
import bloodCategoriesRoutes from "./routes/bloodCategoriesRoutes.js";
import billingsRoutes from "./routes/billingsRoutes.js";
import gstRoutes from "./routes/gstRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import bloodGroupRoutes from "./routes/bloodGroupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import bloodGroupMasterRoutes from "./routes/bloodGroupMasterRoutes.js";
import bloodComponentRoutes from "./routes/bloodComponentRoutes.js";
import countersRoutes from "./routes/countersRoutes.js";
import hospitalRoutes from "./routes/hospitalRoute.js";
import https from "https";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
// app.use(cors({
//   origin: ["https://hopeblood.info"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

app.use(express.json());

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Check DB connection
async function checkDatabaseConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("🟢 Database connected successfully");
  } catch (error) {
    console.error("🔴 Database connection failed:", error.message);
    process.exit(1);
  }
}

// ✅ Route mapping
app.use("/api/users", usersRoutes);
app.use("/api/blood-categories", bloodCategoriesRoutes);
app.use("/api/billings", billingsRoutes);
app.use("/api/gst", gstRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/blood-group", bloodGroupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/blood-groups", bloodGroupRoutes);
app.use("/api/counters", countersRoutes);
app.use("/api/blood-component-master", bloodComponentRoutes);
app.use("/api/blood-group-master", bloodGroupMasterRoutes);
app.use("/api/hospital-master",hospitalRoutes);


app.get("/test", (req, res) => {
  console.log("sdfsdfsdfsdfsdfsdfsdf")
  res.send("Working");
});

// const PORT = process.env.PORT || 5000;

// console.log("DB URL:", process.env.DATABASE_URL);

// checkDatabaseConnection().then(() => {
//   const options = {
//     key: fs.readFileSync("./ssl/key.pem"),
//     cert: fs.readFileSync("./ssl/cert.pem"),
//   };

//   https.createServer(options, app).listen(PORT, () => {
//     console.log(`🚀 HTTPS Server running on port ${PORT}`);
//   });
// });

const PORT = process.env.PORT || 5000;

// ✅ Start after DB connected

checkDatabaseConnection().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
