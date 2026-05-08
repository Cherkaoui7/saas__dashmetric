import { prisma } from "@/lib/prisma"

interface CreateNotificationParams {
  title: string
  message: string
  userId: string
}

export async function createNotification({
  title,
  message,
  userId,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      title,
      message,
      userId,
    },
  })
}
