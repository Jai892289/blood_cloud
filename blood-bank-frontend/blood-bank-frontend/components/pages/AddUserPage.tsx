"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

interface UserFormData {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    counter_location: string;
    role: string;
    status: string;
}

export default function AddUserPage({ onBack }: { onBack: () => void }) {
    const [formData, setFormData] = useState<UserFormData>({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        counter_location: "Active",
        role: "",
        status: "Active",
    });

    const [counters, setCounters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
const [secretKey, setSecretKey] = useState("");



    const fetchCounters = async () => {
        try {
            const res = await axiosInstance.get(ProjectApiList.counters);
            setCounters(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch counters");
        }
    };

    useEffect(() => {
        fetchCounters();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    

    const handleSaveUser = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        if (!formData.password || !formData.confirmPassword) {
            setError("Please enter both password fields.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        const SECRET = "orchid@123";

if (secretKey !== SECRET) {
  setError("❌ Invalid secret key");
  setLoading(false);
  return;
}

        try {
            const res = await axiosInstance.post(ProjectApiList.register, {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                counter_location: formData.counter_location,
                role: formData.role,
                status: formData.status === "Active",
            });

            setSuccess(res.data.message || "User created successfully.");

            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirmPassword: "",
                counter_location: "",
                role: "Counter",
                status: "Active",
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col relative">

            {/* 🔹 Top Navbar (Same as Login Page) */}
            {/* <div className="absolute top-5 left-5 w-[97%] border-b py-4 px-6 flex justify-between items-center bg-white z-50">
        <div className="flex items-center gap-3">
          <img
            src="/orchid-logo.png"
            alt="Logo"
            className="h-10"
          />
          <h1 className="text-xl font-semibold text-gray-900">
            Orchid - Medical Center
          </h1>
        </div>
      </div> */}

            {/* MAIN LAYOUT */}
            <div className="flex flex-1">

                {/* 🔹 Left Illustration (Same as Login Page) */}
                <div className="hidden md:flex w-7/10 items-center justify-center bg-red-50">
                    <img
                        src="/login.png"
                        alt="Register Illustration"
                        className="w-[100%] pt-22"
                    />
                </div>

                {/* 🔹 Right Form Card (Matching Login Box) */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-red-50">
                    <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">

                        {/* Back Button */}
                        <button
                            onClick={onBack}
                            className="text-sm text-gray-600 hover:text-black underline mb-3"
                        >
                            ← Back to Login
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Register New User
                        </h2>

                        <div className="space-y-4">

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="abc@gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                />

                                {formData.confirmPassword && (
                                    <p
                                        className={`mt-1 text-sm font-medium ${formData.password === formData.confirmPassword
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Counter Location
                                </label>
                                <select
                                    name="counter_location"
                                    value={formData.counter_location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
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
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Counter">Counter</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Billing_Staff">Billing Staff</option>
            <option value="Receptionist">Receptionist</option>

                                    

                                    
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="Active">Active</option>
                                    {/* <option value="Inactive">Inactive</option> */}
                                </select>
                            </div>
                            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Secret Key <span className="text-red-500">*</span>
  </label>
  <input
    type="password"
    value={secretKey}
    onChange={(e) => setSecretKey(e.target.value)}
    placeholder="Enter secret key"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
  />
</div>
                        </div>

                        {/* Error Box */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center mt-4">
                                {error}
                            </div>
                        )}

                        {/* Success Box */}
                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center mt-4">
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSaveUser}
                            disabled={loading}
                            className={`w-full mt-6 py-2 rounded-lg text-white font-semibold ${loading
                                    ? "bg-red-400/60"
                                    : "bg-[#e72c3b] hover:bg-red-600"
                                }`}
                        >
                            {loading ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
