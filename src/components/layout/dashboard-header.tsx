import { LogoutButton } from "@/features/auth/components/logout-button"

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div>
        <LogoutButton />
      </div>
    </header>
  )
}