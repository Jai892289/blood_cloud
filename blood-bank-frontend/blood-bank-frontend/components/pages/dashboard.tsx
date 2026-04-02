"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProjectApiList from "../api/ProjectApiList";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  DollarSign,
  Building2,
  Receipt,
  CalendarDays,
} from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ProjectApiList.dashboard);
      const data = res.data.data;

      setDashboardData(data);

      // ✅ Directly use backend's "recentBillings" data (already day + amount)
      if (data.recentBillings && data.recentBillings.length > 0) {
        setChartData(data.recentBillings);
      } else {
        // fallback dummy chart data
        setChartData([
          { day: "Day 1", amount: 45000 },
          { day: "Day 2", amount: 52000 },
          { day: "Day 3", amount: 50000 },
          { day: "Day 4", amount: 60000 },
          { day: "Day 5", amount: 65000 },
          { day: "Day 6", amount: 60000 },
          { day: "Day 7", amount: 70000 },
        ]);
      }
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-600 text-lg">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 mt-10 font-medium">{error}</div>
    );

  const summary = dashboardData?.summary || {};
  const lastBill = dashboardData?.lastBill || "";

  return (
    <div className="p-8 bg-red-50
">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e72c3b] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's your live dashboard summary.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Billing Count</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary.totalBillings ?? 0}
              </p>
              {/* <p className="text-sm text-green-600 mt-2">
                +12% from last month
              </p> */}
            </div>
            <FileText className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Amount Collected</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{Number(summary.totalAmountCollected || 0).toLocaleString()}
              </p>
            </div>

            {/* Rupee Icon */}
            <span className="text-pink-600 text-3xl font-bold">₹</span>
          </div>
        </div>


        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary.totalUsers ?? 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">Active staff users</p>
            </div>
            <Building2 className="w-8 h-8 text-pink-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1"> Last Bill Generated</p>
              <p className="text-md font-bold text-gray-900">
                {/* <span className="font-semibold">Bill No:</span>{" "} */}
                {lastBill.bill_no}
              </p>
              {/* <p className="text-sm text-gray-600 mt-2">{new Date(lastBill.date).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}</p> */}
              <p className="text-sm text-gray-600 mt-2">  ₹{Number(lastBill.total_amount).toLocaleString()}</p>
            </div>
            <Receipt className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-pink-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Daily Billing Overview
        </h2>
        <p className="text-gray-600 text-sm mb-6">Last 7 days billing trend</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ed" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5d4e0",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ fill: "#ec4899", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
}
