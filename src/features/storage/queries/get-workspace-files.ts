import { prisma } from "@/lib/prisma"

export async function getWorkspaceFiles(workspaceId: string) {
  return prisma.file.findMany({
    where: {
      workspaceId,
    },
    include: {
      uploadedBy: {
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
