import { ActivityType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

interface CreateActivityParams {
  type: ActivityType
  message: string
  workspaceId: string
  actorId: string
}

export async function createActivity({
  type,
  message,
  workspaceId,
  actorId,
}: CreateActivityParams) {
  return prisma.activity.create({
    data: {
      type,
      message,
      workspaceId,
      actorId,
    },
  })
}
