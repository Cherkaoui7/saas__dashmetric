import { prisma } from "@/lib/prisma"

export async function getWorkspaceInvitations(workspaceId: string) {
  return prisma.invitation.findMany({
    where: {
      workspaceId,
    },
    include: {
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
