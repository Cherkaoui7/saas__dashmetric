import { prisma } from "@/lib/prisma"

import type { MetricTrendPoint } from "@/features/analytics/types/analytics"

export async function getMetricTrends(
  workspaceId: string
): Promise<MetricTrendPoint[]> {
  const metrics = await prisma.metric.findMany({
    where: {
      workspaceId,
    },
    select: {
      title: true,
      value: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  return metrics.map((metric) => ({
    date: metric.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: metric.value,
    title: metric.title,
  }))
}
