import { SubscriptionPlan } from "@prisma/client"

export const PLAN_LIMITS = {
  FREE: {
    metrics: 5,
    members: 3,
  },
  PRO: {
    metrics: 100,
    members: 25,
  },
  ENTERPRISE: {
    metrics: Number.POSITIVE_INFINITY,
    members: Number.POSITIVE_INFINITY,
  },
} satisfies Record<
  SubscriptionPlan,
  {
    metrics: number
    members: number
  }
>
