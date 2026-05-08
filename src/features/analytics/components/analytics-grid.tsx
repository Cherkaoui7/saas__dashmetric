import type { DashboardAnalytics } from "@/features/analytics/types/analytics"

import { AnalyticsCard } from "@/features/analytics/components/analytics-card"

interface AnalyticsGridProps {
  analytics: DashboardAnalytics
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function AnalyticsGrid({
  analytics,
}: AnalyticsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AnalyticsCard
        title="Total Metrics"
        value={numberFormatter.format(analytics.totalMetrics)}
      />

      <AnalyticsCard
        title="Total Value"
        value={numberFormatter.format(analytics.totalValue)}
      />

      <AnalyticsCard
        title="Average"
        value={analytics.averageValue.toFixed(2)}
      />

      <AnalyticsCard
        title="Highest"
        value={numberFormatter.format(analytics.highestMetric)}
      />

      <AnalyticsCard
        title="Lowest"
        value={numberFormatter.format(analytics.lowestMetric)}
      />
    </div>
  )
}
