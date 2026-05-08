import { prisma } from "@/lib/prisma"

import type { DashboardMetric } from "@/features/dashboard/types/metric"

export async function getWorkspaceMetrics(
  workspaceId: string
): Promise<DashboardMetric[]> {
  return prisma.metric.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
