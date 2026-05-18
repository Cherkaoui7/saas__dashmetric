"use server"

import { WorkspaceRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { isWorkspaceOwner } from "@/features/auth/utils/permissions"
import { createActivity } from "@/features/activity/services/create-activity"
import { sendNotificationEmail } from "@/features/email/services/send-notification-email"
import { createNotification } from "@/features/notifications/services/create-notification"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

const assignableRoles = new Set<WorkspaceRole>(["ADMIN", "MEMBER"])

export async function updateMemberRole(
  membershipId: string,
  role: WorkspaceRole
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currentMembership = await getActiveWorkspaceMembership(session.user.id)

  if (!currentMembership) {
    throw new Error("Membership not found")
  }

  if (!isWorkspaceOwner(currentMembership.role)) {
    throw new Error("Forbidden")
  }

  if (!assignableRoles.has(role)) {
    throw new Error("Invalid role")
  }

  const targetMembership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      workspaceId: currentMembership.workspaceId,
    },
    include: {
      user: true,
    },
  })

  if (!targetMembership) {
    throw new Error("Member not found")
  }

  if (targetMembership.id === currentMembership.id) {
    throw new Error("You cannot change your own role")
  }

  if (targetMembership.role === "OWNER") {
    throw new Error("Owner role cannot be changed")
  }

  const updatedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      role,
    },
  })

  await createActivity({
    type: "ROLE_UPDATED",
    message: `${session.user.email} updated role of ${targetMembership.user.email} to ${role}`,
    workspaceId: currentMembership.workspaceId,
    actorId: session.user.id,
  })

  await createNotification({
    title: "Role Updated",
    message: `Your role in ${currentMembership.workspace.name} has been updated to ${role}`,
    userId: targetMembership.userId,
  })

  await sendNotificationEmail({
    message: `Your role in ${currentMembership.workspace.name} has been updated to ${role}.`,
    subject: "Your workspace role was updated",
    to: targetMembership.user.email,
  })

  revalidatePath("/dashboard")

  return updatedMembership
}
