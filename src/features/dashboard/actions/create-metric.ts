"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import {
  createMetricSchema,
  type CreateMetricInput,
} from "@/features/dashboard/schemas/metric-schema"

export async function createMetric(input: CreateMetricInput) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { title, value } = createMetricSchema.parse(input)

  const metric = await prisma.metric.create({
    data: {
      title,
      value,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard")

  return metric
}
