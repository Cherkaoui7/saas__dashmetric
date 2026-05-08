import type { ActivityType } from "@prisma/client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ActivityFeedProps {
  activities: {
    id: string
    type: ActivityType
    message: string
    createdAt: Date
    actor: {
      email: string
      name: string | null
    }
  }[]
}

function getActivityTone(type: ActivityType) {
  switch (type) {
    case "METRIC_CREATED":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"
    case "MEMBER_INVITED":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
    case "MEMBER_JOINED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
    case "ROLE_UPDATED":
      return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
    case "SUBSCRIPTION_UPDATED":
    default:
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
  }
}

export function ActivityFeed({
  activities,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">
            Workspace activity will appear here once your team starts using the platform.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader className="gap-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                {activity.actor.name?.trim() || activity.actor.email}
              </CardTitle>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getActivityTone(
                  activity.type
                )}`}
              >
                {activity.type.replaceAll("_", " ")}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <p className="text-sm">
              {activity.message}
            </p>

            <p className="text-xs text-muted-foreground">
              {activity.createdAt.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
