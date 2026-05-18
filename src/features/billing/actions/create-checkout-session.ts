"use server"

import type { SubscriptionPlan } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripeClientOrThrow } from "@/lib/stripe"

import { createActivity } from "@/features/activity/services/create-activity"
import { canManageWorkspace } from "@/features/auth/utils/permissions"
import {
  getStripePriceId,
  isPaidPlan,
} from "@/features/billing/utils/stripe-plans"
import { getAppUrl } from "@/features/email/utils/get-app-url"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

export async function createCheckoutSession(
  plan: SubscriptionPlan
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership || !canManageWorkspace(membership.role)) {
    throw new Error("Forbidden")
  }

  if (!isPaidPlan(plan)) {
    throw new Error("Invalid checkout plan")
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      workspaceId: membership.workspaceId,
    },
  })

  if (!subscription) {
    throw new Error("Subscription not found")
  }

  if (subscription.plan === plan && subscription.active) {
    throw new Error("Workspace is already on that plan")
  }

  if (subscription.stripeSubscriptionId && subscription.plan !== "FREE") {
    throw new Error("Use the billing portal to manage an active subscription")
  }

  const stripe = getStripeClientOrThrow()
  const appUrl = getAppUrl()
  const priceId = getStripePriceId(plan)
  let stripeCustomerId = subscription.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: {
        workspaceId: membership.workspaceId,
      },
      name: membership.workspace.name,
    })

    stripeCustomerId = customer.id

    await prisma.subscription.update({
      where: {
        workspaceId: membership.workspaceId,
      },
      data: {
        stripeCustomerId,
      },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${appUrl}/dashboard`,
    client_reference_id: membership.workspaceId,
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      plan,
      workspaceId: membership.workspaceId,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        plan,
        workspaceId: membership.workspaceId,
      },
    },
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a checkout URL")
  }

  await createActivity({
    type: "SUBSCRIPTION_UPDATED",
    message: `${session.user.email} started ${plan} checkout`,
    workspaceId: membership.workspaceId,
    actorId: session.user.id,
  })

  return {
    url: checkoutSession.url,
  }
}
