export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold">
          DashMetrics
        </h2>
      </div>

      <nav className="space-y-2 p-4">
        <div className="rounded-lg px-3 py-2 hover:bg-muted">
          Dashboard
        </div>

        <div className="rounded-lg px-3 py-2 hover:bg-muted">
          Analytics
        </div>

        <div className="rounded-lg px-3 py-2 hover:bg-muted">
          Billing
        </div>

        <div className="rounded-lg px-3 py-2 hover:bg-muted">
          Settings
        </div>
      </nav>
    </aside>
  )
}