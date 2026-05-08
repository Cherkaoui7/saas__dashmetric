import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { AcceptInvitationCard } from "@/features/workspaces/components/accept-invitation-card"
import { getInvitationByToken } from "@/features/workspaces/queries/get-invitation-by-token"

interface InvitationPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = await params
  const session = await auth()
  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              This invitation no longer exists.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = invitation.expiresAt < new Date()
  const signedInEmail = session?.user?.email?.toLowerCase() ?? null
  const emailMatches =
    signedInEmail === invitation.email.toLowerCase()

  let disabledReason: string | undefined

  if (!session?.user?.id) {
    disabledReason = "Sign in with the invited email address, then revisit this link."
  } else if (isExpired) {
    disabledReason = "This invitation has expired."
  } else if (!emailMatches) {
    disabledReason = `This invitation is for ${invitation.email}.`
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle>
            Join {invitation.workspace.name}
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {invitation.invitedBy.name?.trim() || invitation.invitedBy.email}
            {" "}
            invited
            {" "}
            {invitation.email}
            {" "}
            as
            {" "}
            {invitation.role}.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Invitation expires on{" "}
              {invitation.expiresAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            {session?.user?.email ? (
              <p>
                Signed in as {session.user.email}
              </p>
            ) : (
              <p>
                You need to sign in before accepting this invitation.
              </p>
            )}
          </div>

          {!session?.user?.id ? (
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium"
            >
              Go to login
            </Link>
          ) : null}

          <AcceptInvitationCard
            token={token}
            canAccept={!disabledReason}
            disabledReason={disabledReason}
          />
        </CardContent>
      </Card>
    </div>
  )
}
