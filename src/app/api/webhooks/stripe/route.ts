import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { getStripeClient } from "@/lib/stripe"

import {
  downgradeDeletedStripeSubscription,
  syncStripeSubscription,
} from "@/features/billing/services/sync-stripe-subscription"

export const runtime = "nodejs"

async function handleCheckoutSessionCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured")
  }

  if (typeof checkoutSession.subscription !== "string") {
    throw new Error("Checkout session is missing a subscription ID")
  }

  const subscription = await stripe.subscriptions.retrieve(
    checkoutSession.subscription,
    {
      expand: ["items.data.price"],
    }
  )

  await syncStripeSubscription(subscription)
}

export async function POST(request: Request) {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const signature = request.headers.get("stripe-signature")

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      {
        error: "Stripe webhook is not configured",
      },
      {
        status: 500,
      }
    )
  }

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature",
      },
      {
        status: 400,
      }
    )
  }

  const body = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch {
    return NextResponse.json(
      {
        error: "Invalid Stripe signature",
      },
      {
        status: 400,
      }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break
      case "customer.subscription.updated":
        await syncStripeSubscription(
          event.data.object as Stripe.Subscription
        )
        break
      case "customer.subscription.deleted":
        await downgradeDeletedStripeSubscription(
          event.data.object as Stripe.Subscription
        )
        break
      default:
        break
    }

    return NextResponse.json({
      received: true,
    })
  } catch (error) {
    console.error("[stripe:webhook]", error)

    return NextResponse.json(
      {
        error: "Unable to process Stripe webhook",
      },
      {
        status: 500,
      }
    )
  }
}
