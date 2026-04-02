"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import axiosInstance from "@/components/api/axiosInstance"
import ProjectApiList from "@/components/api/ProjectApiList"

interface User {
  id: number
  full_name: string
  email: string
  counter_location: string
  role: string
  status: boolean
  created_at?: string
}

interface UserFormData {
  full_name: string
  email: string
  password: string
  confirmPassword: string
  counter_location: string
  role: string
  status: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [counters, setCounters] = useState<any[]>([]);


  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    counter_location: "",
    role: "Counter",
    status: "Active",
  })

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.users)
      setUsers(res.data.data || [])
    } catch (err: any) {
      console.error("Failed to fetch users:", err)
    }
  }

  const fetchCounters = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.counters);
      setCounters(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch counters:", err);
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchCounters();
  }, []);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ✅ Create or Update user
  const handleSaveUser = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    // ✅ Password validation
    if (!isEditing) {
      if (
        !formData.password ||
        !formData.confirmPassword ||
        formData.password.trim() === "" ||
        formData.confirmPassword.trim() === ""
      ) {
        setError("Please enter both password fields.")
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
      }
    }

    try {
      if (isEditing && selectedUserId) {
        // Update user
        const res = await axiosInstance.put(
          `${ProjectApiList.users}/${selectedUserId}`,
          {
            full_name: formData.full_name,
            email: formData.email,
            counter_location: formData.counter_location,
            role: formData.role,
            status: formData.status === "Active",
          }
        )
        setSuccess(res.data.message || "User updated successfully.")
      } else {
        // Create user
        const res = await axiosInstance.post(ProjectApiList.register, {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          counter_location: formData.counter_location,
          role: formData.role,
          status: formData.status === "Active",
        })
        setSuccess(res.data.message || "User created successfully.")
      }

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        counter_location: "",
        role: "Counter",
        status: "Active",
      })
      setIsModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.message || "Operation failed. Try again."
      setError(backendMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      confirmPassword: "",
      counter_location: user.counter_location,
      role: user.role,
      status: user.status ? "Active" : "Inactive",
    })
    setSelectedUserId(user.id)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await axiosInstance.delete(`${ProjectApiList.users}/${id}`)
      setSuccess("User deleted successfully.")
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user.")
    }
  }

  return (
    <div className="p-8 bg-red-50">
      {/* Header */} 
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e72c3b] mb-2">
          Manage Sub-Users
        </h1>
        <p className="text-gray-600">Create and manage counter users</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg p-6 border border-pink-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Users List</h2>
            <p className="text-gray-600 text-sm">
              All registered counter users
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditing(false)
              setIsModalOpen(true)
              setFormData({
                full_name: "",
                email: "",
                password: "",
                confirmPassword: "",
                counter_location: "",
                role: "Counter",
                status: "Active",
              })
            }}
            className="bg-[#e72c3b] text-white px-4 py-2 rounded-lg hover:bg-[#e72c3b]/80 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Counter
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-pink-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {user.counter_location}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{user.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {user.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-pink-600 hover:bg-pink-100 p-2 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            {/* Form */}
            <div className="space-y-4 mb-6">
              {/* Full Name */}
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Full name"
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />

              {/* Password fields (only on create) */}
              {!isEditing && (
                <>
                  <div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />

                    {/* ✅ Live Password Match Feedback */}
                    {formData.confirmPassword && (
                      <p
                        className={`mt-1 text-sm font-medium ${formData.password === formData.confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {formData.password === formData.confirmPassword
                          ? "✅ Passwords match"
                          : "❌ Passwords do not match"}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Counter Location */}
              <select
                name="counter_location"
                value={formData.counter_location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Counter</option>

                {counters
                  .filter((c) => c.is_active === true)
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
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="Admin">Admin</option>
                <option value="Counter">Counter</option>
              </select>

              {/* Status */}
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>


            {/* Messages */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 mb-3 rounded-md text-sm text-center border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 p-3 mb-3 rounded-md text-sm text-center border border-green-200">
                {success}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${loading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-[#e72c3b] hover:bg-pink-700"
                  }`}
              >
                {loading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update User"
                    : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
