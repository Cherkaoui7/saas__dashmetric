import type {
  AnalyticsInsight,
  DashboardAnalytics,
  MetricTrendPoint,
} from "@/features/analytics/types/analytics"
import {
  calculatePercentageChange,
  getTrendDirection,
} from "@/features/analytics/utils/trends"

function formatSignedPercentage(value: number) {
  const formatted = `${Math.abs(value).toFixed(1)}%`

  return value > 0 ? `+${formatted}` : `-${formatted}`
}

export function buildAnalyticsInsights(
  analytics: DashboardAnalytics,
  trends: MetricTrendPoint[]
): AnalyticsInsight[] {
  if (analytics.totalMetrics === 0) {
    return [
      {
        title: "No data yet",
        summary:
          "Create your first metric to unlock KPI trends, usage insights, and reporting.",
        direction: "neutral",
      },
    ]
  }

  const insights: AnalyticsInsight[] = [
    {
      title: "KPI snapshot",
      summary: `You are tracking ${analytics.totalMetrics} metrics with an average value of ${analytics.averageValue.toFixed(
        2
      )}.`,
      direction: "neutral",
    },
  ]

  if (trends.length >= 2) {
    const firstPoint = trends[0]
    const lastPoint = trends[trends.length - 1]
    const direction = getTrendDirection(firstPoint.value, lastPoint.value)
    const percentageChange = calculatePercentageChange(
      firstPoint.value,
      lastPoint.value
    )

    let summary = `Latest tracked value is ${direction} compared with your earliest recorded metric.`

    if (percentageChange !== null && direction !== "flat") {
      summary = `Latest tracked value moved ${formatSignedPercentage(
        percentageChange
      )} versus your earliest recorded metric.`
    } else if (direction === "flat") {
      summary =
        "Latest tracked value is stable compared with your earliest recorded metric."
    }

    insights.push({
      title: "Trend direction",
      summary,
      direction,
    })
  } else {
    insights.push({
      title: "Trend direction",
      summary:
        "Add at least one more metric entry to unlock comparative trend analysis.",
      direction: "neutral",
    })
  }

  if (analytics.highestMetric > analytics.averageValue * 1.5) {
    insights.push({
      title: "Peak performance",
      summary:
        "Your highest metric is significantly above the workspace average, which may indicate a breakout event worth investigating.",
      direction: "up",
    })
  } else {
    insights.push({
      title: "Range health",
      summary:
        "Metric values are staying relatively close to the workspace average, which suggests a stable reporting pattern.",
      direction: "flat",
    })
  }

  return insights
}
