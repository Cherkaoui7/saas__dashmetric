"use client"

import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { markNotificationRead } from "@/features/notifications/actions/mark-notification-read"

interface NotificationsMenuProps {
  notifications: {
    id: string
    title: string
    message: string
    read: boolean
    createdAt: Date
  }[]
}

function formatUnreadCount(count: number) {
  return count > 9 ? "9+" : count.toString()
}

export function NotificationsMenu({
  notifications,
}: NotificationsMenuProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  function handleMarkAsRead(notificationId: string) {
    setPendingId(notificationId)

    startTransition(async () => {
      try {
        await markNotificationRead(notificationId)
        router.refresh()
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
        >
          <Bell />

          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
              {formatUnreadCount(unreadCount)}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLabel>
          Notifications
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="max-h-96 space-y-2 overflow-y-auto p-1">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-3 ${
                  notification.read ? "opacity-70" : "bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {notification.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {!notification.read ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending && pendingId === notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      {isPending && pendingId === notification.id
                        ? "Saving..."
                        : "Mark read"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
