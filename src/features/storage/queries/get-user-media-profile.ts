import { prisma } from "@/lib/prisma"

export async function getUserMediaProfile(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      image: true,
      name: true,
    },
  })
}
