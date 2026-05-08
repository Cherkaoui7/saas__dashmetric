"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { canManageWorkspace } from "@/features/auth/utils/permissions"
import {
  createMetricSchema,
  type CreateMetricInput,
} from "@/features/dashboard/schemas/metric-schema"
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

  const { title, value } = createMetricSchema.parse(input)

  const metric = await prisma.metric.create({
    data: {
      title,
      value,
      workspaceId: membership.workspaceId,
    },
  })

  revalidatePath("/dashboard")

  return metric
}
