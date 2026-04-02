"use client"

import type { ReactNode } from "react"
import Sidebar from "@/components/sidebar"
import CounterSidebar from "@/components/counter-sidebar"
import Header from "@/components/header"
import CounterHeader from "@/components/counter-header"

interface LayoutWrapperProps {
  children: ReactNode
  userRole: "Admin" | "Counter"
  userName: string
  counterId?: string
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
  bgColor?: string
}

export default function LayoutWrapper({
  children,
  userRole,
  userName,
  counterId,
  currentPage,
  onPageChange,
  onLogout,
  bgColor = "bg-[#e72c3b]",
}: LayoutWrapperProps) {
  const isAdmin = userRole === "Admin"

  return (
    <div className={`flex h-screen ${bgColor}`}>
      {/* 🧱 Sidebar */}
      <div className="w-64 fixed h-screen overflow-hidden z-[50]">
        {isAdmin ? (
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={onPageChange}
            onLogout={onLogout}
          />
        ) : (
          <CounterSidebar
            currentPage={currentPage}
            setCurrentPage={onPageChange}
            onLogout={onLogout}
          />
        )}
      </div>

      {/* 🩸 Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <div className={`sticky top-0 ${bgColor} z-[40]`}>
          {isAdmin ? (
            <Header userName={userName} />
          ) : (
            <CounterHeader
              userName={userName}
              counterId={counterId || ""}
              onLogout={onLogout}
            />
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
