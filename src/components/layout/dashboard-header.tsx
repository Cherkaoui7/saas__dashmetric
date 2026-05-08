import { auth } from "@/lib/auth"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { NotificationsMenu } from "@/features/notifications/components/notifications-menu"
import { getUserNotifications } from "@/features/notifications/queries/get-user-notifications"

export async function DashboardHeader() {
  const session = await auth()
  const notifications = session?.user?.id
    ? await getUserNotifications(session.user.id)
    : []

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <NotificationsMenu notifications={notifications} />
        <LogoutButton />
      </div>
    </header>
  )
}