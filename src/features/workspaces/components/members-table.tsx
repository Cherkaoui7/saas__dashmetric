"use client"

import type { WorkspaceRole } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { updateMemberRole } from "@/features/workspaces/actions/update-member-role"

const editableRoles = ["ADMIN", "MEMBER"] as const

interface MembersTableProps {
  members: {
    id: string
    userId: string
    role: WorkspaceRole
    user: {
      email: string
      name: string | null
    }
  }[]
  canManageMembers: boolean
  currentMembershipId: string
}

export function MembersTable({
  members,
  canManageMembers,
  currentMembershipId,
}: MembersTableProps) {
  return (
    <div className="space-y-4">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          canManageMembers={canManageMembers}
          isCurrentUser={member.id === currentMembershipId}
        />
      ))}
    </div>
  )
}

interface MemberRowProps {
  member: MembersTableProps["members"][number]
  canManageMembers: boolean
  isCurrentUser: boolean
}

function MemberRow({
  member,
  canManageMembers,
  isCurrentUser,
}: MemberRowProps) {
  const router = useRouter()
  const [role, setRole] = useState<"ADMIN" | "MEMBER">(
    member.role === "ADMIN" ? "ADMIN" : "MEMBER"
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canEditRole =
    canManageMembers &&
    !isCurrentUser &&
    member.role !== "OWNER"

  function handleRoleUpdate() {
    setError(null)

    startTransition(async () => {
      try {
        await updateMemberRole(member.id, role)
        router.refresh()
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Unable to update member role."
        )
      }
    })
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {member.user.name?.trim() || member.user.email}
            </CardTitle>

            <p className="truncate text-sm text-muted-foreground">
              {member.user.email}
            </p>
          </div>

          <span className="rounded-full border px-3 py-1 text-xs font-medium">
            {member.role}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isCurrentUser ? (
          <p className="text-sm text-muted-foreground">
            This is your current membership.
          </p>
        ) : null}

        {canEditRole ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "ADMIN" | "MEMBER")
              }
              disabled={isPending}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 sm:max-w-40"
            >
              {editableRoles.map((editableRole) => (
                <option key={editableRole} value={editableRole}>
                  {editableRole}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={handleRoleUpdate}
              disabled={isPending || role === member.role}
            >
              {isPending ? "Updating..." : "Update role"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {member.role === "OWNER"
              ? "The workspace owner role is fixed."
              : "Only workspace owners can change member roles."}
          </p>
        )}

        {error ? (
          <p className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
