import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.js",
  out: "./drizzle",

  dialect: "postgresql",   // ✅ REQUIRED

  dbCredentials: {
    url: process.env.DATABASE_URL,   // ✅ use url (not connectionString)
  },
});