"use client"

import { useState } from "react"

import {
  LayoutDashboard,
  FilePlus,
  ClipboardList
} from "lucide-react";

interface CounterSidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  onLogout?: () => void
}

export default function ReceptionistSidebar({
  currentPage,
  setCurrentPage,
  onLogout,
}: CounterSidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "Refernce List", icon: LayoutDashboard },

    
        //    { id: "billing-history", icon: LayoutDashboard, label: "Billing History" },

    
  ];

  // 🧩 Open confirmation popup
  const handleLogoutClick = () => {
    setShowConfirm(true)
  }

  // ✅ Confirm and clean logout
  const confirmLogout = () => {
    // Remove all session-related data
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("counterLocation")
    localStorage.removeItem("userId")

    // Or clear all if you prefer a total reset
    // localStorage.clear()

    setShowConfirm(false)

    // Trigger parent logout callback
    if (onLogout) onLogout()
  }

  // ❌ Cancel logout
  const cancelLogout = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-orange-100 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-pink-100 flex justify-center">
          <img
            src="/orchid-logo.png"   // 👉 put your logo path here
            alt="Orchid Blood Center"
            className="h-16 object-contain"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                  ? "bg-[#e72c3b] text-white font-semibold"
                  : "text-gray-700 hover:bg-orange-50"
                }`}
            >
              <span className="text-xl"><item.icon />
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-orange-100">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-3 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 ">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out from your account?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
