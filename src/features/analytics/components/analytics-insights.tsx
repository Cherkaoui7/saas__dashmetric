import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { AnalyticsInsight } from "@/features/analytics/types/analytics"

interface AnalyticsInsightsProps {
  insights: AnalyticsInsight[]
}

function getToneClass(direction: AnalyticsInsight["direction"]) {
  switch (direction) {
    case "up":
      return "text-emerald-600"
    case "down":
      return "text-amber-600"
    case "flat":
      return "text-sky-600"
    case "neutral":
    default:
      return "text-muted-foreground"
  }
}

export function AnalyticsInsights({
  insights,
}: AnalyticsInsightsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => (
        <Card key={insight.title}>
          <CardHeader>
            <CardTitle className="text-base">
              {insight.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className={`text-sm ${getToneClass(insight.direction)}`}>
              {insight.summary}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
