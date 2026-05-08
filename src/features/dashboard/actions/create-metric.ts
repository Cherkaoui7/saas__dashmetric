"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import {
  createMetricSchema,
  type CreateMetricInput,
} from "@/features/dashboard/schemas/metric-schema"
import { getActiveWorkspace } from "@/features/workspaces/queries/get-active-workspace"

export async function createMetric(input: CreateMetricInput) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workspace = await getActiveWorkspace(session.user.id)

  if (!workspace) {
    throw new Error("No active workspace found.")
  }

  const { title, value } = createMetricSchema.parse(input)

  const metric = await prisma.metric.create({
    data: {
      title,
      value,
      workspaceId: workspace.id,
    },
  })

  revalidatePath("/dashboard")

  return metric
}
