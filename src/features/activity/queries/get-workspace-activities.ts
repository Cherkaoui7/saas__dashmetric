import { prisma } from "@/lib/prisma"

export async function getWorkspaceActivities(
  workspaceId: string
) {
  return prisma.activity.findMany({
    where: {
      workspaceId,
    },
    include: {
      actor: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })
}
