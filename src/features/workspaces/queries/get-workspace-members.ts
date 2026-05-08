import { prisma } from "@/lib/prisma"

export async function getWorkspaceMembers(workspaceId: string) {
  return prisma.membership.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
      role: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })
}
