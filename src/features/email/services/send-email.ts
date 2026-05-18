import type { ReactNode } from "react"

import { getResendClient } from "@/lib/email"

interface SendEmailParams {
  idempotencyKey?: string
  react: ReactNode
  subject: string
  text?: string
  to: string
}

type EmailDeliveryResult =
  | {
      id: string | null
      status: "sent"
    }
  | {
      reason: string
      status: "skipped" | "failed"
    }

export async function sendEmail({
  idempotencyKey,
  react,
  subject,
  text,
  to,
}: SendEmailParams): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  const resend = getResendClient()

  if (!apiKey || !from || !resend) {
    console.info("[email:skipped]", {
      reason: "RESEND_API_KEY or EMAIL_FROM is missing",
      subject,
      to,
    })

    return {
      reason: "Email provider is not configured.",
      status: "skipped",
    }
  }

  const response = await resend.emails.send(
    {
      from,
      react,
      subject,
      text,
      to,
    },
    idempotencyKey
      ? {
          idempotencyKey,
        }
      : undefined
  )

  if (response.error) {
    console.error("[email:failed]", {
      error: response.error.message,
      subject,
      to,
    })

    return {
      reason: response.error.message,
      status: "failed",
    }
  }

  return {
    id: response.data?.id ?? null,
    status: "sent",
  }
}
