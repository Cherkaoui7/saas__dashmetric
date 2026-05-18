import Stripe from "stripe"

export const STRIPE_API_VERSION = "2026-04-22.dahlia"

let stripeClient: Stripe | null = null

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

  if (!secretKey) {
    return null
  }

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  })

  return stripeClient
}

export function getStripeClientOrThrow() {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured")
  }

  return stripe
}
