"use client"

import { useState } from "react"
import {
  LayoutGrid,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  onLogout?: () => void
}

export default function AccountantSidebar({
  currentPage,
  setCurrentPage,
  onLogout,
}: SidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const menuItems = [
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
        { id: "billing-history", icon: FileText, label: "Billing History" },
    // { id: "user-management", icon: Users, label: "User Management" },
    // { id: "billing-setup", icon: FileText, label: "Billing Setup" },
    // { id: "blood-component-master-admin", icon: BarChart3, label: "Component Master" },
    // { id: "add-billing", icon: BarChart3, label: "Add Billing" },
    // { id: "blood-group-master-admin", icon: BarChart3, label: "Blood Group Master" },
    // { id: "counters-admin", icon: BarChart3, label: "Counters" },
    // { id: "hospital-admin", icon: BarChart3, label: "Hospital" },
    // { id: "settings", icon: Settings, label: "Settings" },
  ]

  const handleLogoutClick = () => {
    setShowConfirm(true)
  }

  const confirmLogout = () => {
    // 🔒 Remove all auth-related localStorage data
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("counterId")

    // Optional: clear all storage if needed
    // localStorage.clear()

    setShowConfirm(false)
    if (onLogout) onLogout()
  }

  const cancelLogout = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-pink-100 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-pink-100 flex justify-center">
          <img
            src="/orchid-logo.png"   // 👉 put your logo path here
            alt="Orchid Blood Center"
            className="h-16 object-contain"
          />

           <img
            src="/icon2.png"   // 👉 put your logo path here
            alt="Orchid Blood Center"
            className="h-16 object-contain"
          />
        </div>


        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-[#e72c3b] text-white font-medium "
                    : "text-gray-700 hover:bg-orange-50"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium ">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-pink-100">
          <button
            onClick={handleLogoutClick}
            className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="bg-[#e72c3b] cursor-pointer hover:bg-[#e72c3b]/80 text-white px-4 py-2 rounded-md font-medium"
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
