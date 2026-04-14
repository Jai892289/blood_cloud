import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//     ssl: false,

//   //  ssl: {
//   //   rejectUnauthorized: false, // REQUIRED for Railway
//   // },
// });

export const db = drizzle(pool, { schema });
export { schema };
