import type { SubscriptionPlan } from "@prisma/client"

const paidPlans = ["PRO", "ENTERPRISE"] as const

const priceEnvKeys = {
  ENTERPRISE: "STRIPE_ENTERPRISE_PRICE_ID",
  PRO: "STRIPE_PRO_PRICE_ID",
} satisfies Record<(typeof paidPlans)[number], string>

export function isPaidPlan(
  plan: SubscriptionPlan
): plan is (typeof paidPlans)[number] {
  return paidPlans.includes(plan as (typeof paidPlans)[number])
}

export function getStripePriceId(plan: SubscriptionPlan) {
  if (!isPaidPlan(plan)) {
    throw new Error("Free plans do not use Stripe Checkout")
  }

  const priceId = process.env[priceEnvKeys[plan]]?.trim()

  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for ${plan}`)
  }

  return priceId
}

export function getPlanFromStripePriceId(priceId?: string | null) {
  if (!priceId) {
    return null
  }

  return paidPlans.find((plan) => {
    return process.env[priceEnvKeys[plan]]?.trim() === priceId
  }) ?? null
}
