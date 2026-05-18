import type Stripe from "stripe"

import { prisma } from "@/lib/prisma"

import { createActivity } from "@/features/activity/services/create-activity"
import { getPlanFromStripePriceId } from "@/features/billing/utils/stripe-plans"

const activeStripeStatuses = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
])

function getStripeCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id
}

function getStripePriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.id ?? null
}

async function recordSubscriptionActivity({
  active,
  plan,
  previousActive,
  previousPlan,
  workspaceId,
  workspaceName,
  ownerId,
}: {
  active: boolean
  ownerId: string
  plan: string
  previousActive: boolean
  previousPlan: string
  workspaceId: string
  workspaceName: string
}) {
  if (plan === previousPlan && active === previousActive) {
    return
  }

  await createActivity({
    type: "SUBSCRIPTION_UPDATED",
    message: `${workspaceName} billing synced to ${plan}`,
    workspaceId,
    actorId: ownerId,
  })
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription
) {
  const workspaceId = subscription.metadata.workspaceId
  const stripeCustomerId = getStripeCustomerId(subscription)
  const stripeSubscriptionId = subscription.id
  const stripePriceId = getStripePriceId(subscription)
  const plan = getPlanFromStripePriceId(stripePriceId) ?? "FREE"
  const active = activeStripeStatuses.has(subscription.status)

  const existingSubscription =
    workspaceId
      ? await prisma.subscription.findUnique({
          where: {
            workspaceId,
          },
          include: {
            workspace: {
              select: {
                name: true,
                ownerId: true,
              },
            },
          },
        })
      : await prisma.subscription.findFirst({
          where: {
            OR: [
              {
                stripeCustomerId,
              },
              {
                stripeSubscriptionId,
              },
            ],
          },
          include: {
            workspace: {
              select: {
                name: true,
                ownerId: true,
              },
            },
          },
        })

  if (!existingSubscription) {
    throw new Error("Subscription record not found for Stripe event")
  }

  const updatedSubscription = await prisma.subscription.update({
    where: {
      id: existingSubscription.id,
    },
    data: {
      active,
      plan,
      stripeCustomerId,
      stripeSubscriptionId,
    },
  })

  await recordSubscriptionActivity({
    active,
    ownerId: existingSubscription.workspace.ownerId,
    plan,
    previousActive: existingSubscription.active,
    previousPlan: existingSubscription.plan,
    workspaceId: existingSubscription.workspaceId,
    workspaceName: existingSubscription.workspace.name,
  })

  return updatedSubscription
}

export async function downgradeDeletedStripeSubscription(
  subscription: Stripe.Subscription
) {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    include: {
      workspace: {
        select: {
          name: true,
          ownerId: true,
        },
      },
    },
  })

  if (!existingSubscription) {
    return null
  }

  const updatedSubscription = await prisma.subscription.update({
    where: {
      id: existingSubscription.id,
    },
    data: {
      active: true,
      plan: "FREE",
      stripeSubscriptionId: null,
    },
  })

  await recordSubscriptionActivity({
    active: true,
    ownerId: existingSubscription.workspace.ownerId,
    plan: "FREE",
    previousActive: existingSubscription.active,
    previousPlan: existingSubscription.plan,
    workspaceId: existingSubscription.workspaceId,
    workspaceName: existingSubscription.workspace.name,
  })

  return updatedSubscription
}
