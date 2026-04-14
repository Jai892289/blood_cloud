"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/components/api/axiosInstance"
import ProjectApiList from "@/components/api/ProjectApiList"

interface UserFormData {
  full_name: string
  email: string
  password: string
  confirmPassword: string
  counter_location: string
  role: string
  status: string
}

export default function AddUserPage() {
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    counter_location: "",
    role: "Counter",
    status: "Active",
  })

  const [counters, setCounters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const fetchCounters = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.counters)
      setCounters(res.data.data || [])
    } catch (err) {
      console.error("Failed to fetch counters")
    }
  }

  useEffect(() => {
    fetchCounters()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveUser = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter both password fields.")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.post(ProjectApiList.register, {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        counter_location: formData.counter_location,
        role: formData.role,
        status: formData.status === "Active",
      })

      setSuccess(res.data.message || "User created successfully.")

      // Reset
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        counter_location: "",
        role: "Counter",
        status: "Active",
      })
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-red-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e72c3b] mb-2">Add New User</h1>
        <p className="text-gray-600">Create a new counter user</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-pink-200 max-w-xl mx-auto">
        <div className="space-y-4">
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Full name"
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          />

          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="w-full px-4 py-2 border border-pink-300 rounded-lg"
            />

            {formData.confirmPassword && (
              <p
                className={`mt-1 text-sm font-medium ${
                  formData.password === formData.confirmPassword
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formData.password === formData.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Counter */}
          <select
            name="counter_location"
            value={formData.counter_location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          >
            <option value="">Select Counter</option>
            {counters
              .filter((c) => c.is_active)
              .map((c) => (
                <option key={c.id} value={c.counter_name}>
                  {c.counter_name} — ({c.location})
                </option>
              ))}
          </select>

          {/* Role */}
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          >
            <option value="Admin">Admin</option>
            <option value="Counter">Counter</option>
            <option value="Accountant">Accountant</option>
            <option value="Billing_Staff">Billing Staff</option>
            <option value="Receptionist">Receptionist</option>

            
          </select>

          {/* Status */}
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 mt-4 rounded-md text-center border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 mt-4 rounded-md text-center border border-green-200">
            {success}
          </div>
        )}

        <button
          onClick={handleSaveUser}
          disabled={loading}
          className={`mt-6 w-full py-2 rounded-lg text-white font-semibold ${
            loading ? "bg-orange-300" : "bg-[#e72c3b] hover:bg-pink-700"
          }`}
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </div>
  )
}
