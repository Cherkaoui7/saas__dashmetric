import { prisma } from "@/lib/prisma"

import type { DashboardMetric } from "@/features/dashboard/types/metric"

export async function getUserMetrics(
  userId: string
): Promise<DashboardMetric[]> {
  return prisma.metric.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
