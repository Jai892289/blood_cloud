"use client";

import { useState } from "react";
import axiosInstance from "./api/axiosInstance";
import ProjectApiList from "./api/ProjectApiList";

type UserRole = "Admin" | "Counter" | null;

interface LoginProps {
  onLogin: (role: UserRole, name: string, counterId?: string) => void;
  onOpenRegister?: () => void;  // ⬅ NEW
}



export default function Login({ onLogin, onOpenRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post(ProjectApiList.login, {
        email,
        password,
      });

      const { user, token } = res.data.data;

      if (!user.status) {
        setError("Your account is inactive. Please contact the admin.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.full_name);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("useStatus", user.status);
      if (user.counter_location)
        localStorage.setItem("counterLocation", user.counter_location);

      onLogin(user.role as UserRole, user.full_name, user.counter_location);
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">

      {/* 🔹 Top Navbar */}
      <div className="absolute top-5 left-5 w-[97%] border-b py-4 px-6 flex justify-between items-center bg-white z-50 ">
        <div className="flex items-center gap-3">
          <img
            src="/orchid-logo.png"
            alt="Blood Donation Logo"
            className=" h-10"
          />
          <img
            src="/icon2.png"
            alt="Blood Donation Logo"
            className=" h-10"
          />
          <h1 className="text-xl font-semibold text-gray-900">Orchid - Blood Center ( Managed by Shonit Foundation)</h1>
          
        </div>

        {/* <div className="flex items-center gap-6">
      <button className="text-gray-600 hover:text-gray-800">
        🔍
      </button>
      <button className="flex items-center gap-2 text-gray-700">
        🌐 EN
      </button>
      <img
        src="/user-avatar.png"
        className="w-10 h-10 rounded-full border"
      />
    </div> */}
      </div>

      {/* 🔹 Main Layout */}
      <div className="flex flex-1">

        {/* LEFT Section — Illustration */}
        <div className="hidden md:flex w-7/10 items-center justify-center bg-red-50">
          <img
            src="/login.png"
            alt="Blood Donation"
            className="w-[100%] pt-22"
          />
        </div>

        {/* RIGHT Section — Login Box */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-red-50">
          <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Log In Now — let’s save the life together.
            </h2>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Id
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Extra Row */}
              {/* <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-red-500" />
                  <span className="text-gray-700">Keep me logged in</span>
                </label>

                <button className="text-red-500 hover:underline">
                  Forget password?
                </button>
              </div> */}

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white font-semibold ${loading ? "bg-[#e72c3b]/50" : "bg-[#e72c3b] hover:bg-red-600"
                  }`}
              >
                {loading ? "Logging in..." : "Login "}
              </button>

              {/* {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  type="button"
                  className="w-full mt-4 text-red-600 hover:underline text-center"
                >
                  Create New User (Register)
                </button>
              )} */}

            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
