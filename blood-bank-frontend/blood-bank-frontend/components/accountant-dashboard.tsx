"use client"

import { useState } from "react"
import LayoutWrapper from "@/components/layout-wrapper"
import Dashboard from "@/components/pages/dashboard"
import BillingSetup from "@/components/pages/billing-setup"
import UserManagement from "@/components/pages/user-management"
import BillingRecords from "@/components/pages/billing-records"
import ReportsAnalytics from "@/components/pages/reports-analytics"
import BloodComponentMasterAdmin from "./pages/blood-component-master-admin"
import BloodGroupMasterAdmin from "./pages/blood-group-master-admin"
import CountersAdmin from "./pages/counters-admin"
import HospitalAdmin from "./pages/hospital-admin"
import CounterBillingHistory from "./pages/counter-billing-history"
import CounterNewBilling from "./pages/counter-new-billing"

interface AdminDashboardProps {
  userName: string
  onLogout: () => void
}

export default function AccountantDashboard({ userName, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "user-management":
        return <UserManagement />
      case "billing-setup":
        return <BillingSetup />
      case "billing-records":
        return <BillingRecords />
      case "reports-analytics":
        return <ReportsAnalytics />
      case "blood-component-master-admin":
        return <BloodComponentMasterAdmin />
      case "blood-group-master-admin":
        return <BloodGroupMasterAdmin />
      case "billing-history":
        return <CounterBillingHistory />
//         case "hospital-admin":
//         return <HospitalAdmin />
// case "add-billing":
//         return <CounterNewBilling />
        
      default:
        return <Dashboard />
    }
  }

  return (
    <LayoutWrapper
      userRole="Accountant"
      userName={userName}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={onLogout}
      bgColor="bg-pink-50"
    >
      {renderPage()}
    </LayoutWrapper>
  )
}
