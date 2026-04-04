"use client"

import axios from "axios"

// ✅ Create a reusable axios instance
const axiosInstance = axios.create({
  // baseURL: "http://localhost:5000/api", // 🔗 Your backend base URL
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    // baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

// ✅ Automatically attach JWT token (if exists)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Global error handler for expired tokens or 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⛔ Session expired or unauthorized, redirecting to login...")
      localStorage.removeItem("token")
      // window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
