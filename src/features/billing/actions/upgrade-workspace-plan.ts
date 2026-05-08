"use server"

import { SubscriptionPlan } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { canManageWorkspace } from "@/features/auth/utils/permissions"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

const upgradablePlans = new Set<SubscriptionPlan>([
  "PRO",
  "ENTERPRISE",
])

export async function upgradeWorkspacePlan(
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

  if (!upgradablePlans.has(plan)) {
    throw new Error("Invalid upgrade target")
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      workspaceId: membership.workspaceId,
    },
  })

  if (!subscription) {
    throw new Error("Subscription not found")
  }

  if (subscription.plan === plan) {
    throw new Error("Workspace is already on that plan")
  }

  const updatedSubscription = await prisma.subscription.update({
    where: {
      workspaceId: membership.workspaceId,
    },
    data: {
      plan,
      active: true,
    },
  })

  revalidatePath("/dashboard")

  return updatedSubscription
}
