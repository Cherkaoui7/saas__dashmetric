"use client"

import type { WorkspaceRole } from "@prisma/client"
import { useRouter } from "next/navigation"
import { type FormEvent, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { inviteMember } from "@/features/workspaces/actions/invite-member"

const inviteRoles = ["ADMIN", "MEMBER"] as const

interface InviteMemberFormProps {
  canInviteMembers: boolean
}

export function InviteMemberForm({
  canInviteMembers,
}: InviteMemberFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<(typeof inviteRoles)[number]>("MEMBER")
  const [error, setError] = useState<string | null>(null)
  const [invitePath, setInvitePath] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInvitePath(null)

    if (!canInviteMembers) {
      setError("Only workspace owners and admins can invite teammates.")
      return
    }

    startTransition(async () => {
      try {
        const invitation = await inviteMember(email, role as WorkspaceRole)
        setEmail("")
        setRole("MEMBER")
        setInvitePath(`/invitations/${invitation.token}`)
        router.refresh()
      } catch (inviteError) {
        setError(
          inviteError instanceof Error
            ? inviteError.message
            : "Unable to create invitation."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Invite teammate</CardTitle>
        <CardDescription>
          {canInviteMembers
            ? "Invite a teammate into this workspace with a predefined role."
            : "Only admins and owners can send workspace invitations."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              disabled={!canInviteMembers || isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as (typeof inviteRoles)[number])
              }
              disabled={!canInviteMembers || isPending}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            >
              {inviteRoles.map((inviteRole) => (
                <option key={inviteRole} value={inviteRole}>
                  {inviteRole}
                </option>
              ))}
            </select>
          </div>

          {invitePath ? (
            <div className="rounded-lg border border-dashed p-3">
              <p className="text-sm font-medium">
                Invitation created
              </p>

              <p className="mt-1 break-all text-sm text-muted-foreground">
                Share this path with the teammate:
                {" "}
                {invitePath}
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={!canInviteMembers || isPending}
          >
            {isPending ? "Sending invite..." : "Send invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
