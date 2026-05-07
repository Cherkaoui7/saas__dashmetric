import { ReactNode } from "react"

import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}