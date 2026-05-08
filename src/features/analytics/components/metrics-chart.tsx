"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { MetricTrendPoint } from "@/features/analytics/types/analytics"

interface MetricsChartProps {
  data: MetricTrendPoint[]
}

export function MetricsChart({
  data,
}: MetricsChartProps) {
  function formatTooltipValue(
    value:
      | number
      | string
      | ReadonlyArray<number | string>
      | undefined
  ) {
    const rawValue = Array.isArray(value) ? value[0] : value

    if (rawValue === undefined) {
      return "-"
    }

    const numericValue =
      typeof rawValue === "number" ? rawValue : Number(rawValue)

    return Number.isFinite(numericValue)
      ? new Intl.NumberFormat("en-US").format(numericValue)
      : String(rawValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metric trends</CardTitle>
        <CardDescription>
          Chart-ready workspace dataset for reporting and KPI monitoring.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--color-border)",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                  formatter={formatTooltipValue}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.title
                      ? `${payload[0].payload.title} (${payload[0].payload.date})`
                      : "Metric"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-chart-2)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--color-chart-2)",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "var(--color-chart-2)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add metrics to generate a trend chart for this workspace.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
