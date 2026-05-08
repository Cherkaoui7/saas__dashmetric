import { prisma } from "@/lib/prisma"

import type { DashboardAnalytics } from "@/features/analytics/types/analytics"

export async function getDashboardAnalytics(
  workspaceId: string
): Promise<DashboardAnalytics> {
  const aggregate = await prisma.metric.aggregate({
    where: {
      workspaceId,
    },
    _count: {
      _all: true,
    },
    _sum: {
      value: true,
    },
    _avg: {
      value: true,
    },
    _max: {
      value: true,
    },
    _min: {
      value: true,
    },
  })

  return {
    totalMetrics: aggregate._count._all,
    totalValue: aggregate._sum.value ?? 0,
    averageValue: aggregate._avg.value ?? 0,
    highestMetric: aggregate._max.value ?? 0,
    lowestMetric: aggregate._min.value ?? 0,
  }
}
