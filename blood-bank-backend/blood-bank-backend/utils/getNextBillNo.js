// utils/getNextBillNo.js
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

export const getNextBillNo = async () => {
  const result = await db.execute(
    sql`SELECT nextval('bill_no_seq')`
  );

  const serial = result.rows[0].nextval;
  const year = new Date().getFullYear();

  return `BB${year}${String(serial).padStart(10, "0")}`;
};