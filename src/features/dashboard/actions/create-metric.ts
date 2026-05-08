"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription"
import { PLAN_LIMITS } from "@/features/billing/utils/plans"
import { canManageWorkspace } from "@/features/auth/utils/permissions"
import {
  createMetricSchema,
  type CreateMetricInput,
} from "@/features/dashboard/schemas/metric-schema"
import { createActivity } from "@/features/activity/services/create-activity"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

export async function createMetric(input: CreateMetricInput) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership) {
    throw new Error("No active workspace found.")
  }

  if (!canManageWorkspace(membership.role)) {
    throw new Error("Forbidden")
  }

  const subscription = await getWorkspaceSubscription(membership.workspaceId)

  if (!subscription?.active) {
    throw new Error("Workspace subscription is inactive")
  }

  const metricCount = await prisma.metric.count({
    where: {
      workspaceId: membership.workspaceId,
    },
  })

  if (
    metricCount >= PLAN_LIMITS[subscription.plan].metrics
  ) {
    throw new Error("Metric limit reached. Upgrade required.")
  }

  const { title, value } = createMetricSchema.parse(input)

  const metric = await prisma.metric.create({
    data: {
      title,
      value,
      workspaceId: membership.workspaceId,
    },
  })

  await createActivity({
    type: "METRIC_CREATED",
    message: `${session.user.email} created a metric: ${title}`,
    workspaceId: membership.workspaceId,
    actorId: session.user.id,
  })

  revalidatePath("/dashboard")

  return metric
}
