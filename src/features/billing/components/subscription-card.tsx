"use client"

import type { SubscriptionPlan } from "@prisma/client"
import { CreditCard, ExternalLink, Settings } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { createBillingPortalSession } from "@/features/billing/actions/create-billing-portal-session"
import { createCheckoutSession } from "@/features/billing/actions/create-checkout-session"

interface SubscriptionCardProps {
  active: boolean
  plan: SubscriptionPlan
  metricsUsed: number
  metricsLimit: number
  membersUsed: number
  membersLimit: number
  canManageBilling: boolean
  hasStripeCustomer: boolean
}

function formatLimit(limit: number) {
  return Number.isFinite(limit) ? limit.toString() : "Unlimited"
}

const checkoutPlans = ["PRO", "ENTERPRISE"] as const

export function SubscriptionCard({
  active,
  plan,
  metricsUsed,
  metricsLimit,
  membersUsed,
  membersLimit,
  canManageBilling,
  hasStripeCustomer,
}: SubscriptionCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const metricsAtLimit =
    Number.isFinite(metricsLimit) && metricsUsed >= metricsLimit
  const membersAtLimit =
    Number.isFinite(membersLimit) && membersUsed >= membersLimit

  function redirectToStripe(
    action: () => Promise<{ url: string }>,
    actionName: string
  ) {
    setError(null)
    setPendingAction(actionName)

    startTransition(async () => {
      try {
        const stripeSession = await action()
        window.location.assign(stripeSession.url)
      } catch (billingError) {
        setError(
          billingError instanceof Error
            ? billingError.message
            : "Unable to start Stripe billing."
        )
      } finally {
        setPendingAction(null)
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Stripe-backed billing with webhook-confirmed subscription state.
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
            {active ? "Active" : "Inactive"}
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

        {plan === "FREE" ? (
          <div className="space-y-2">
            {checkoutPlans.map((checkoutPlan) => (
              <Button
                key={checkoutPlan}
                type="button"
                className="w-full"
                variant={checkoutPlan === "PRO" ? "default" : "outline"}
                onClick={() =>
                  redirectToStripe(
                    () => createCheckoutSession(checkoutPlan),
                    checkoutPlan
                  )
                }
                disabled={!canManageBilling || isPending}
              >
                <CreditCard />
                {isPending && pendingAction === checkoutPlan
                  ? "Opening checkout..."
                  : `Start ${checkoutPlan} checkout`}
              </Button>
            ))}
          </div>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={() =>
              redirectToStripe(
                createBillingPortalSession,
                "portal"
              )
            }
            disabled={!canManageBilling || isPending}
          >
            <Settings />
            {isPending && pendingAction === "portal"
              ? "Opening portal..."
              : "Manage billing"}
          </Button>
        )}

        {plan === "FREE" && hasStripeCustomer ? (
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() =>
              redirectToStripe(
                createBillingPortalSession,
                "portal"
              )
            }
            disabled={!canManageBilling || isPending}
          >
            <ExternalLink />
            Open billing portal
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
