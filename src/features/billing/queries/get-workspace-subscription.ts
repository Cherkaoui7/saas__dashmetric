import { prisma } from "@/lib/prisma"

export async function getWorkspaceSubscription(
  workspaceId: string
) {
  return prisma.subscription.findUnique({
    where: {
      workspaceId,
    },
  })
}
