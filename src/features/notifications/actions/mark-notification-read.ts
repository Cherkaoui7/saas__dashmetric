"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function markNotificationRead(
  notificationId: string
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
  })

  if (!notification) {
    throw new Error("Notification not found")
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  })

  revalidatePath("/dashboard")

  return updatedNotification
}
