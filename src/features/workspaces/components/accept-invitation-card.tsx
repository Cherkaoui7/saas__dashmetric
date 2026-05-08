"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

import { acceptInvitation } from "@/features/workspaces/actions/accept-invitation"

interface AcceptInvitationCardProps {
  token: string
  canAccept: boolean
  disabledReason?: string
}

export function AcceptInvitationCard({
  token,
  canAccept,
  disabledReason,
}: AcceptInvitationCardProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError(null)

    if (!canAccept) {
      setError(disabledReason ?? "You cannot accept this invitation.")
      return
    }

    startTransition(async () => {
      try {
        await acceptInvitation(token)
        router.push("/dashboard")
      } catch (acceptError) {
        setError(
          acceptError instanceof Error
            ? acceptError.message
            : "Unable to accept invitation."
        )
      }
    })
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full"
        onClick={handleAccept}
        disabled={!canAccept || isPending}
      >
        {isPending ? "Joining workspace..." : "Accept invitation"}
      </Button>

      {disabledReason && !error ? (
        <p className="text-sm text-muted-foreground">
          {disabledReason}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
