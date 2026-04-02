"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { day: "1", amount: 5000 },
  { day: "2", amount: 4500 },
  { day: "3", amount: 6000 },
  { day: "4", amount: 5500 },
  { day: "5", amount: 7000 },
  { day: "6", amount: 9000 },
  { day: "7", amount: 8500 },
]

export default function CounterReports() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Overview of your billing performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Today's Billing Summary</p>
              <p className="text-3xl font-bold text-gray-900">₹0</p>
              <p className="text-gray-500 text-xs mt-2">0 bills generated</p>
            </div>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Total Units Sold</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-gray-500 text-xs mt-2">Blood units today</p>
            </div>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Highest Category Sold</p>
              <p className="text-3xl font-bold text-gray-900">N/A</p>
              <p className="text-gray-500 text-xs mt-2">No data</p>
            </div>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Last 7 Days Billing Trend</h3>
        <p className="text-gray-600 text-sm mb-4">Revenue trend over the last 10 days</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
