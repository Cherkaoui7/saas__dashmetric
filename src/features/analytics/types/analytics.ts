export interface DashboardAnalytics {
  totalMetrics: number
  totalValue: number
  averageValue: number
  highestMetric: number
  lowestMetric: number
}

export interface MetricTrendPoint {
  date: string
  value: number
  title: string
}

export interface AnalyticsInsight {
  title: string
  summary: string
  direction: "up" | "down" | "flat" | "neutral"
}
