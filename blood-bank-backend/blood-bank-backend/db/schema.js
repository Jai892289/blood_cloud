import { pgTable, serial, varchar, integer, boolean, numeric, timestamp, jsonb, text } from "drizzle-orm/pg-core";

/* -------------------- USERS TABLE -------------------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  counter_location: varchar("counter_location", { length: 100 }),
  status: boolean("status").default(true),
  role: varchar("role", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});


/* -------------------- BLOOD CATEGORIES TABLE -------------------- */
export const blood_categories = pgTable("blood_categories", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  cross_match: integer("cross_match").default(0).notNull(),  // NEW FIELD
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  is_available: boolean("is_available").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});


/* -------------------- BILLINGS TABLE -------------------- */

export const billings = pgTable("billings", {
  id: serial("id").primaryKey(),

  // 🧾 Bill Info
  // bill_no: varchar("bill_no", { length: 50 }).notNull(),
  bill_no: varchar("bill_no", { length: 50 }),
  reference_id: varchar("reference_id", { length: 50 }).unique(),
status: varchar("status", { length: 20 }).default("PENDING"),
  date: timestamp("date").defaultNow(),

  // 👨‍⚕️ Patient Info
  patient_name: varchar("patient_name", { length: 100 }).notNull(),
  sex: varchar("sex", { length: 10 }).notNull(),
  age_years: integer("age_years"),
age_months: integer("age_months"),
age_days: integer("age_days"),
  age: text("age"),
// age: numeric("age", { precision: 5, scale: 2 }).notNull(),
  mobile_number: varchar("mobile_number", { length: 15 }),
  father_husband_name: varchar("father_husband_name", { length: 100 }),
  hospital_name: varchar("hospital_name", { length: 150 }),
  referred_by_dr: varchar("referred_by_dr", { length: 150 }),
  crn: varchar("crn", { length: 50 }),
  ward: varchar("ward", { length: 50 }),
  bed: varchar("bed", { length: 50 }),
  ipd_no: varchar("ipd_no", { length: 50 }),
payment_details: jsonb("payment_details"),
  hos_bill: varchar("hos_bill", { length: 50 }),
  hos_pat_reg: varchar("hos_pat_reg", { length: 50 }),
  is_cancelled: boolean("is_cancelled").default(false),
cancel_remark: text("cancel_remark"),
cancelled_at: timestamp("cancelled_at"),
temp_test_column: varchar("temp_test_column", { length: 50 }),
new_field: varchar("new_field", { length: 50 }),
blood_component_details: jsonb("blood_component_details"),
total_amount: numeric("total_amount", { precision: 12, scale: 2 }),
  // 💉 Blood Component Details (JSON)
  // blood_component_details: jsonb("blood_component_details").notNull(),

  // 🧮 Totals
  // total_amount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

  // 👤 User Info (optional FK)
  user_id: integer("user_id")
    .references(() => users.id, { onDelete: "set null" })
    .default(null),

    
  // 💳 Payment Info
  is_paid: boolean("is_paid").default(false).notNull(),
  payment_method: varchar("payment_method", { length: 50 }).default("Cash"),

  // ⏰ Audit fields
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});




/* -------------------- GST PERCENT TABLE -------------------- */
export const gst_percent = pgTable("gst_percent", {
  id: serial("id").primaryKey(),
  percent: numeric("percent", { precision: 5, scale: 2 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});


/* -------------------- CATEGORIES TABLE -------------------- */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
//   description: varchar("description", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});


/* -------------------- BLOOD GROUP TABLE -------------------- */
export const blood_group = pgTable("blood_group", {
  id: serial("id").primaryKey(),
  group_name: varchar("group_name", { length: 10 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* -------------------- COUNTERS TABLE -------------------- */
export const counters = pgTable("counters", {
  id: serial("id").primaryKey(),
  counter_name: varchar("counter_name", { length: 100 }).notNull(),
  location: varchar("location", { length: 150 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* -------------------- BLOOD GROUP MASTER TABLE -------------------- */
export const blood_group_master = pgTable("blood_group_master", {
  id: serial("id").primaryKey(),
  group_name: varchar("group_name", { length: 10 }).notNull().unique(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* -------------------- BLOOD COMPONENT MASTER TABLE -------------------- */
export const blood_component_master = pgTable("blood_component_master", {
  id: serial("id").primaryKey(),
  component_name: varchar("component_name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});


/*--------------------------ADD HOSPITAL ------------------------------*/

export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  hospital_name: varchar("hospital_name", { length: 150 }).notNull(),
  commission: numeric("commission", { precision: 5, scale: 2 }).default("0"),
  serial_no: integer("serial_no").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});