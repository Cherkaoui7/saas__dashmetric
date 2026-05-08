import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  CreateMetricForm,
} from "@/features/dashboard/components/create-metric-form"
import { DashboardCard } from "@/features/dashboard/components/dashboard-card"
import { getUserMetrics } from "@/features/dashboard/queries/get-user-metrics"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const metrics = await getUserMetrics(session.user.id)
  const totalMetricValue = metrics.reduce(
    (sum, metric) => sum + metric.value,
    0
  )
  const latestMetric = metrics[0]

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard overview
        </h1>

        <p className="text-muted-foreground">
          Track the metrics owned by {session.user.email ?? "your account"}.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title="Tracked metrics"
            value={metrics.length}
            description="Total metrics linked to your account."
          />

          <DashboardCard
            title="Total value"
            value={totalMetricValue}
            description="Combined value across every saved metric."
          />

          <DashboardCard
            title={latestMetric?.title ?? "Latest entry"}
            value={latestMetric?.value ?? 0}
            description={
              latestMetric
                ? "Most recent metric added to your dashboard."
                : "Create your first metric to start filling the dashboard."
            }
          />
        </div>

        <CreateMetricForm />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Your metrics
          </h2>

          <p className="text-sm text-muted-foreground">
            Every record below is filtered by the authenticated user.
          </p>
        </div>

        {metrics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <DashboardCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                description={metric.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">
                No metrics yet. Use the form above to add your first dashboard
                record.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
