"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripeClientOrThrow } from "@/lib/stripe"

import { canManageWorkspace } from "@/features/auth/utils/permissions"
import { getAppUrl } from "@/features/email/utils/get-app-url"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

export async function createBillingPortalSession() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership || !canManageWorkspace(membership.role)) {
    throw new Error("Forbidden")
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      workspaceId: membership.workspaceId,
    },
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error("Stripe customer not found")
  }

  const stripe = getStripeClientOrThrow()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${getAppUrl()}/dashboard`,
  })

  return {
    url: portalSession.url,
  }
}
