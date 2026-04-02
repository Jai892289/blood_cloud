import { db } from "../db/index.js";
import {
  users,
  billings,
  blood_categories,
  gst_percent,
} from "../db/schema.js";
import { eq, count, sum, sql, desc } from "drizzle-orm";

export const getDashboardStats = async (req, res) => {
  try {
    // Optional user_id
    const userId =
      req.user?.id ||
      req.query.user_id ||
      req.headers["user-id"] ||
      null;

    // 🧮 Total users
    const userCount = await db.select({ count: count() }).from(users);
    const totalUsers = userCount[0]?.count || 0;

    // ---------------------------------------------
    // 💰 Total Billing Count (conditional filtering)
    // ---------------------------------------------
    let billingCountQuery = db.select({ count: count() }).from(billings);
    if (userId) billingCountQuery = billingCountQuery.where(eq(billings.user_id, userId));

    const billingCount = await billingCountQuery;
    const totalBillings = billingCount[0]?.count || 0;

    // ---------------------------------------------
    // 💵 Total Amount Collected (conditional filtering)
    // ---------------------------------------------
    let amountQuery = db
      .select({ total: sum(billings.total_amount) })
      .from(billings)
      .where(eq(billings.is_paid, true));

    if (userId) amountQuery = amountQuery.where(eq(billings.user_id, userId));

    const totalAmountResult = await amountQuery;
    const totalAmountCollected = Number(totalAmountResult[0]?.total || 0);

    // 🩸 Available Blood Categories
    const availableBloodCategories = await db
      .select({
        id: blood_categories.id,
        category: blood_categories.category,
        cross_match: blood_categories.cross_match,
        rate: blood_categories.rate,
        is_available: blood_categories.is_available,
      })
      .from(blood_categories)
      .where(eq(blood_categories.is_available, true));

    // 💸 GST
    const gstPercentResult = await db
      .select({ percent: gst_percent.percent })
      .from(gst_percent)
      .where(eq(gst_percent.is_active, true));

    const gstPercent = gstPercentResult[0]?.percent || null;

    // ---------------------------------------------
    // 📊 Last 7 days billing chart (conditional filter)
    // ---------------------------------------------
    const recentBillingsRaw = await db.execute(
      sql`
        SELECT 
          TO_CHAR(created_at, 'Dy') AS day,
          SUM(total_amount) AS amount
        FROM billings
        WHERE is_paid = true
        ${userId ? sql`AND user_id = ${userId}` : sql``}
        GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 7;
      `
    );

    const recentBillings = (recentBillingsRaw.rows || [])
      .map((item) => ({
        day: item.day.trim(),
        amount: Number(item.amount || 0),
      }))
      .reverse();

    // ---------------------------------------------
    // 🧾 Last Bill (conditional filtering)
    // ---------------------------------------------
    let lastBillQuery = db
      .select()
      .from(billings)
      .orderBy(desc(billings.created_at))
      .limit(1);

    if (userId) lastBillQuery = lastBillQuery.where(eq(billings.user_id, userId));

    const lastBillResult = await lastBillQuery;
    const lastBill = lastBillResult[0] || null;

    // ---------------------------------------------
    // 📦 Final Response
    // ---------------------------------------------
    const dashboardData = {
      summary: {
        totalUsers,
        totalBillings,
        totalAmountCollected,
        gstPercent,
      },
      bloodCategories: availableBloodCategories,
      recentBillings,
      lastBill,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};


