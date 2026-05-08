import { prisma } from "@/lib/prisma"

export async function getActiveWorkspace(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: {
      userId,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const ownerMembership = memberships.find(
    (membership) => membership.role === "OWNER"
  )

  return ownerMembership?.workspace ?? memberships[0]?.workspace ?? null
}
