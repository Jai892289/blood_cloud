"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProjectApiList from "../api/ProjectApiList";
import { useRouter } from "next/navigation";

export default function CounterHomePage({ setCurrentPage }: any) {

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentBills, setRecentBills] = useState<any[]>([]);




  const fetchRecentBills = async () => {
    try {
      const userId = localStorage.getItem("userId"); // 🔥 read from localStorage

      const res = await axiosInstance.get(`${ProjectApiList.dashboardRecentBills}`, {
        params: {
          limit: 5,
          userId: userId || undefined, // only send if exists
        },
      });

      setRecentBills(res.data.data || []);
    } catch (err: any) {
      console.error("Recent Bills Fetch Error:", err);
    }
  };


  // 🧠 Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;

      const res = await axiosInstance.get(ProjectApiList.dashboard, {
        params: {
          user_id: userId || undefined, // Optional filter
        }
      });

      setDashboardData(res.data.data);
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

  useEffect(() => {
    fetchDashboardData();
    fetchRecentBills(); // 👈 add this
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

  // ✅ Extract Data Safely
  const summary = dashboardData?.summary || {};
  const lastBill = dashboardData?.lastBill || null;

  const totalBills = summary.totalBillings || 0;
  const totalCollected = Number(summary.totalAmountCollected || 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        {/* LEFT SECTION (Keep as it is) */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of today's billing activities</p>
        </div>

        {/* RIGHT SECTION — Add Bill Button */}
        <div>
          <button
            onClick={() => setCurrentPage("new-billing")}
            className="bg-[#e72c3b] cursor-pointer text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition"
          >
            + Add Bill
          </button>
        </div>

      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* ✅ Total Bills Count */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Bills Generated</p>
              <p className="text-4xl font-bold text-gray-900">{totalBills}</p>
              <p className="text-gray-500 text-xs mt-2">
                All bills recorded in system
              </p>
            </div>
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* ✅ Total Amount Collected */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Amount Collected</p>
              <p className="text-4xl font-bold text-gray-900">
                ₹{totalCollected.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Overall revenue collected
              </p>
            </div>

            {/* Rupee Icon */}
            <span className="text-red-500 text-2xl font-bold">₹</span>
          </div>
        </div>


        {/* ✅ Last Bill Generated */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Last Bill Generated</p>
              <p className="text-xl font-bold text-gray-900">
                {lastBill?.bill_no || "—"}
              </p>
              {lastBill ? (
                <>
                  <p className="text-gray-600 text-xs mt-2">
                    {/* {new Date(lastBill.date).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "} */}
                    Amount - ₹{Number(lastBill.total_amount).toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Name- {lastBill.patient_name}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-xs mt-2">
                  No bill generated yet
                </p>
              )}
            </div>
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ✅ Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">

          {/* New Bill */}
          <button
            onClick={() => setCurrentPage("new-billing")}
            className="flex flex-col items-center cursor-pointer justify-center gap-3 p-6 border-2 border-gray-200 rounded-lg
      hover:border-red-500 hover:bg-red-50 transition-all"
          >
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">New Bill</span>
          </button>

          {/* Bill History */}
          <button
            onClick={() => setCurrentPage("billing-history")}
            className="flex flex-col items-center cursor-pointer justify-center gap-3 p-6 border-2 border-gray-200 rounded-lg
      hover:border-red-500 hover:bg-red-50 transition-all"
          >
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">Bill History</span>
          </button>

        </div>
      </div>



      {/* ✅ Recent Activity */}
      {/* ✅ Recent Activity in Table Format */}
      <div className="bg-white rounded-lg  p-6 shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>

        {recentBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Bill No</th>
                  <th className="py-3 px-4 border-b text-left">Date</th>
                  <th className="py-3 px-4 border-b text-left">Patient</th>
                  <th className="py-3 px-4 border-b text-left">Hospital</th>
                  <th className="py-3 px-4 border-b text-left">Components</th>
                  <th className="py-3 px-4 border-b text-right">Amount</th>
                  <th className="py-3 px-4 border-b text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    {/* Bill Number */}
                    <td className="py-3 px-4 border-b font-medium text-gray-900">
                      {bill.bill_no}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 border-b text-gray-600">
                      {new Date(bill.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    {/* Patient Name */}
                    <td className="py-3 px-4 border-b text-gray-700">
                      {bill.patient_name}
                    </td>

                    {/* Hospital Name */}
                    <td className="py-3 px-4 border-b text-gray-700">
                      {bill.hospital_name}
                    </td>

                    {/* Blood Component Details */}
                    <td className="py-3 px-4 border-b text-gray-700">
                      {bill.blood_component_details?.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {bill.blood_component_details.map((comp: any, idx: number) => (
                            <li key={idx}>
                              {comp.particulars || "N/A"} (Qty: {comp.quantity})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 border-b text-right font-semibold text-gray-900">
                      ₹{Number(bill.total_amount).toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 border-b text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${bill.is_paid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {bill.is_paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent billing activity</p>
        )}
      </div>

    </div>
  );
}
