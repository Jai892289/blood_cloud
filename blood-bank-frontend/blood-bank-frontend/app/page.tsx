"use client"

import { useEffect, useState } from "react"
import Login from "@/components/login"
import AdminDashboard from "@/components/admin-dashboard"
import CounterDashboard from "@/components/counter-dashboard"
import AddUserPage from "@/components/pages/AddUserPage"
// import AddUserPage from "@/components/add-user-page"  // ⬅ NEW
import { Toaster } from "react-hot-toast";

type UserRole = "Admin" | "Counter" | null

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userName, setUserName] = useState<string>("")
  const [counterId, setCounterId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  const [showAddUser, setShowAddUser] = useState(false) // ⬅ NEW

  // Restore session on reload
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("userRole") as UserRole
    const name = localStorage.getItem("userName")
    const counter = localStorage.getItem("counterId")

    if (token && role && name) {
      setUserRole(role)
      setUserName(name)
      if (counter) setCounterId(counter)
    }

    setIsLoading(false)
  }, [])

  const handleLogin = (role: UserRole, name: string, id?: string) => {
    setUserRole(role)
    setUserName(name)
    if (id) setCounterId(id)

    localStorage.setItem("userRole", role || "")
    localStorage.setItem("userName", name)
    if (id) localStorage.setItem("counterLocation", id)
  }

  const handleLogout = () => {
    setUserRole(null)
    setUserName("")
    setCounterId("")

    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("counterLocation")
    localStorage.removeItem("userId")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    )
  }

  // ⬅ Show AddUserPage Instead of Login
  if (showAddUser) {
    return <AddUserPage onBack={() => setShowAddUser(false)} />
  }

  if (!userRole) {
    return (
      <div>
        <Toaster />
        <Login
          onLogin={handleLogin}
          onOpenRegister={() => setShowAddUser(true)}
        />

        {/* <div className="mt-4 text-center">
          <button
            onClick={() => setShowAddUser(true)}
            className="text-red-600 hover:underline"
          >
            Create New User (Register)
          </button>
        </div> */}
      </div>
    )
  }

  return userRole === "Admin" ? (
    <AdminDashboard userName={userName} onLogout={handleLogout} />
  ) : (
    <CounterDashboard
      userName={userName}
      counterId={counterId}
      onLogout={handleLogout}
    />
  )
}
