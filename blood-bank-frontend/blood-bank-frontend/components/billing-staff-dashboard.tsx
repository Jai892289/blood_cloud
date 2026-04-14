"use client"

import { useState } from "react"
import LayoutWrapper from "@/components/layout-wrapper"
import CounterHomePage from "@/components/pages/counter-home"
import CounterNewBilling from "@/components/pages/counter-new-billing"
import CounterBillingHistory from "@/components/pages/counter-billing-history"
import CounterReports from "@/components/pages/counter-reports"
import CounterSettings from "@/components/pages/counter-settings"
import Dashboard from "./pages/dashboard"

interface CounterDashboardProps {
  userName: string
  counterId: string
  onLogout: () => void
}

export default function BillingStaffDashboard({ userName, counterId, onLogout }: CounterDashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
                return <Dashboard />
        
        // return <CounterHomePage setCurrentPage={setCurrentPage} />
      case "billing-history":
        return <CounterBillingHistory />
    //   case "billing-history":
    //     return <CounterBillingHistory />
      case "reports":
        return <CounterReports />
    //   case "settings":
    //     return <CounterSettings userName={userName} counterId={counterId} />
      default:
        return <CounterHomePage />
    }
  }

  return (
    <LayoutWrapper
      userRole="Billing_Staff"
      userName={userName}
      counterId={counterId}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={onLogout}
      bgColor="bg-red-50"
    >
      {renderPage()}
    </LayoutWrapper>
  )
}
