"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Building2, Award } from "lucide-react"

const chartData = [
  { day: "Day 1", amount: 45000 },
  { day: "Day 2", amount: 52000 },
  { day: "Day 3", amount: 48000 },
  { day: "Day 4", amount: 60000 },
  { day: "Day 5", amount: 55000 },
  { day: "Day 6", amount: 42000 },
  { day: "Day 7", amount: 68000 },
  { day: "Day 8", amount: 65000 },
  { day: "Day 9", amount: 62000 },
  { day: "Day 10", amount: 55000 },
]

export default function ReportsAnalytics() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pink-600 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive billing insights and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Billing (This Month)</p>
              <p className="text-3xl font-bold text-gray-900">₹5,45,000</p>
              <p className="text-sm text-gray-600 mt-2">Nov 1 - Nov 10, 2025</p>
            </div>
            <TrendingUp className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Counters Active</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600 mt-2">All operational</p>
            </div>
            <Building2 className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-pink-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Highest Revenue Counter</p>
              <p className="text-3xl font-bold text-gray-900">Counter 2</p>
              <p className="text-sm text-gray-600 mt-2">₹2,20,000 this month</p>
            </div>
            <Award className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-pink-100">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Daily Billing Trend</h2>
        <p className="text-gray-600 text-sm mb-6">Revenue trend over the last 10 days</p>
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
            <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
