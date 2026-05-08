import { prisma } from "@/lib/prisma"

export async function getInvitationByToken(token: string) {
  return prisma.invitation.findUnique({
    where: {
      token,
    },
    include: {
      workspace: true,
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })
}
