import Link from "next/link"
import type { WorkspaceRole } from "@prisma/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InvitationsListProps {
  invitations: {
    id: string
    email: string
    role: WorkspaceRole
    token: string
    expiresAt: Date
    invitedBy: {
      email: string
      name: string | null
    }
  }[]
}

export function InvitationsList({
  invitations,
}: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">
            No pending invitations yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => {
        const isExpired = invitation.expiresAt < now

        return (
          <Card key={invitation.id}>
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">
                    {invitation.email}
                  </CardTitle>

                  <p className="truncate text-sm text-muted-foreground">
                    Role: {invitation.role}
                  </p>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {isExpired ? "EXPIRED" : "PENDING"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Invited by{" "}
                {invitation.invitedBy.name?.trim() || invitation.invitedBy.email}
              </p>

              <p>
                Expires on{" "}
                {invitation.expiresAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <p className="break-all">
                Acceptance path:{" "}
                <Link
                  href={`/invitations/${invitation.token}`}
                  className="underline underline-offset-4"
                >
                  /invitations/{invitation.token}
                </Link>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
