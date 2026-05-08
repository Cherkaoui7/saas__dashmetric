import { WorkspaceRole } from "@prisma/client"

import { prisma } from "@/lib/prisma"

function getRolePriority(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return 3
    case "ADMIN":
      return 2
    case "MEMBER":
    default:
      return 1
  }
}

export async function getActiveWorkspaceMembership(userId: string) {
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

  const [activeMembership] = memberships.sort((left, right) => {
    return getRolePriority(right.role) - getRolePriority(left.role)
  })

  return activeMembership ?? null
}
