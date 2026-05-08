import { redirect } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { canManageWorkspace, isWorkspaceOwner } from "@/features/auth/utils/permissions"
import { SubscriptionCard } from "@/features/billing/components/subscription-card"
import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription"
import { PLAN_LIMITS } from "@/features/billing/utils/plans"
import {
  CreateMetricForm,
} from "@/features/dashboard/components/create-metric-form"
import { DashboardCard } from "@/features/dashboard/components/dashboard-card"
import { getWorkspaceMetrics } from "@/features/dashboard/queries/get-workspace-metrics"
import { InviteMemberForm } from "@/features/workspaces/components/invite-member-form"
import { InvitationsList } from "@/features/workspaces/components/invitations-list"
import { getWorkspaceMembers } from "@/features/workspaces/queries/get-workspace-members"
import { MembersTable } from "@/features/workspaces/components/members-table"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"
import { getWorkspaceInvitations } from "@/features/workspaces/queries/get-workspace-invitations"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const activeMembership = await getActiveWorkspaceMembership(session.user.id)

  if (!activeMembership) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">
            No active workspace found for this account yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const workspace = activeMembership.workspace
  const metrics = await getWorkspaceMetrics(workspace.id)
  const members = await getWorkspaceMembers(workspace.id)
  const invitations = await getWorkspaceInvitations(workspace.id)
  const subscription = await getWorkspaceSubscription(workspace.id)
  const totalMetricValue = metrics.reduce(
    (sum, metric) => sum + metric.value,
    0
  )
  const latestMetric = metrics[0]
  const canCreateMetrics = canManageWorkspace(activeMembership.role)
  const canManageMembers = isWorkspaceOwner(activeMembership.role)
  const canInviteMembers = canManageWorkspace(activeMembership.role)
  const canManageBilling = canManageWorkspace(activeMembership.role)
  const currentPlan = subscription?.plan ?? "FREE"
  const currentLimits = PLAN_LIMITS[currentPlan]

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard overview
        </h1>

        <h2 className="text-lg font-medium">
          {workspace.name}
        </h2>

        <p className="text-muted-foreground">
          Track metrics shared inside {workspace.name}.
        </p>

        <p className="text-sm text-muted-foreground">
          Signed in as {activeMembership.role}.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title="Tracked metrics"
            value={metrics.length}
            description="Total metrics linked to this workspace."
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

        <CreateMetricForm canCreateMetrics={canCreateMetrics} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Billing and plan usage
            </h2>

            <p className="text-sm text-muted-foreground">
              Workspace limits now follow the active subscription plan.
            </p>
          </div>

          <SubscriptionCard
            plan={currentPlan}
            metricsUsed={metrics.length}
            metricsLimit={currentLimits.metrics}
            membersUsed={members.length}
            membersLimit={currentLimits.members}
            canManageBilling={canManageBilling}
          />
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                FREE limits metrics to 5 and members to 3.
              </p>

              <p>
                PRO expands capacity for growing teams and dashboards.
              </p>

              <p>
                ENTERPRISE removes the default usage caps with mock local billing.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Pending invitations
            </h2>

            <p className="text-sm text-muted-foreground">
              Track teammate onboarding links, roles, and expiration dates.
            </p>
          </div>

          <InvitationsList invitations={invitations} />
        </div>

        <InviteMemberForm canInviteMembers={canInviteMembers} />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Workspace metrics
          </h2>

          <p className="text-sm text-muted-foreground">
            Every record below is filtered by the active workspace.
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

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Workspace members
          </h2>

          <p className="text-sm text-muted-foreground">
            Owners can manage roles. Admins and members can only review the
            roster.
          </p>
        </div>

        <MembersTable
          members={members}
          canManageMembers={canManageMembers}
          currentMembershipId={activeMembership.id}
        />
      </section>
    </div>
  )
}
