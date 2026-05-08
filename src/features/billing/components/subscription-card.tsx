"use client"

import type { SubscriptionPlan } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { upgradeWorkspacePlan } from "@/features/billing/actions/upgrade-workspace-plan"

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  metricsUsed: number
  metricsLimit: number
  membersUsed: number
  membersLimit: number
  canManageBilling: boolean
}

function formatLimit(limit: number) {
  return Number.isFinite(limit) ? limit.toString() : "Unlimited"
}

function getUpgradeTarget(plan: SubscriptionPlan) {
  switch (plan) {
    case "FREE":
      return "PRO"
    case "PRO":
      return "ENTERPRISE"
    case "ENTERPRISE":
    default:
      return null
  }
}

function getUpgradeLabel(plan: SubscriptionPlan) {
  switch (plan) {
    case "FREE":
      return "Upgrade to PRO"
    case "PRO":
      return "Upgrade to ENTERPRISE"
    case "ENTERPRISE":
    default:
      return "Top tier active"
  }
}

export function SubscriptionCard({
  plan,
  metricsUsed,
  metricsLimit,
  membersUsed,
  membersLimit,
  canManageBilling,
}: SubscriptionCardProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const upgradeTarget = getUpgradeTarget(plan)
  const metricsAtLimit =
    Number.isFinite(metricsLimit) && metricsUsed >= metricsLimit
  const membersAtLimit =
    Number.isFinite(membersLimit) && membersUsed >= membersLimit

  function handleUpgrade() {
    if (!upgradeTarget) {
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        await upgradeWorkspacePlan(upgradeTarget)
        router.refresh()
      } catch (upgradeError) {
        setError(
          upgradeError instanceof Error
            ? upgradeError.message
            : "Unable to update subscription."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Mock billing architecture with plan-based usage enforcement.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Current plan
            </p>

            <p className="text-2xl font-semibold">
              {plan}
            </p>
          </div>

          <span className="rounded-full border px-3 py-1 text-xs font-medium">
            {plan}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-lg border p-3">
            <p className="font-medium">
              Metrics usage
            </p>

            <p className="text-muted-foreground">
              {metricsUsed} / {formatLimit(metricsLimit)}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="font-medium">
              Members usage
            </p>

            <p className="text-muted-foreground">
              {membersUsed} / {formatLimit(membersLimit)}
            </p>
          </div>

          <div className="rounded-lg border border-dashed p-3 text-muted-foreground">
            <p>
              {plan === "FREE"
                ? "FREE workspaces have tight limits and basic collaboration."
                : plan === "PRO"
                  ? "PRO unlocks larger team and metric capacity."
                  : "ENTERPRISE removes the default workspace usage caps."}
            </p>
          </div>
        </div>

        {metricsAtLimit || membersAtLimit ? (
          <p className="text-sm text-amber-600">
            Usage limit reached. Upgrade required for additional capacity.
          </p>
        ) : null}

        {!canManageBilling ? (
          <p className="text-sm text-muted-foreground">
            Only admins and owners can manage plan changes.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className="w-full"
          variant={plan === "ENTERPRISE" ? "outline" : "default"}
          onClick={handleUpgrade}
          disabled={!canManageBilling || !upgradeTarget || isPending}
        >
          {isPending ? "Updating plan..." : getUpgradeLabel(plan)}
        </Button>
      </CardContent>
    </Card>
  )
}
