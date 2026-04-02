"use client"

import { Search, Bell } from "lucide-react"

interface HeaderProps {
  userName?: string
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-pink-100 px-8 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 ">
        <h1 className="text-xl">Orchid - Blood Center ( Managed by Shonit Foundation)</h1>
      
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6 ml-8">
        {/* Notifications */}
        {/* <button className="relative p-2 hover:bg-pink-50 rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-pink-600 rounded-full"></span>
        </button> */}

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
            {userName
              ? userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
              : "AD"}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-800">{userName || "Admin User"}</p>
            {/* <p className="text-gray-600">admin@bloodbank.com</p> */}
          </div>
        </div>
      </div>
    </header>
  )
}
