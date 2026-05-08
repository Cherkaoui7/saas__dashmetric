import { prisma } from "@/lib/prisma"

import { createNotification } from "@/features/notifications/services/create-notification"

interface CreateWorkspaceNotificationsParams {
  title: string
  message: string
  workspaceId: string
  excludeUserId?: string
}

export async function createWorkspaceNotifications({
  title,
  message,
  workspaceId,
  excludeUserId,
}: CreateWorkspaceNotificationsParams) {
  const memberships = await prisma.membership.findMany({
    where: {
      workspaceId,
      ...(excludeUserId
        ? {
            userId: {
              not: excludeUserId,
            },
          }
        : {}),
    },
    select: {
      userId: true,
    },
  })

  return Promise.all(
    memberships.map((membership) =>
      createNotification({
        title,
        message,
        userId: membership.userId,
      })
    )
  )
}
