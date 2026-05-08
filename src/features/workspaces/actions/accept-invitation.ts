"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription"
import { PLAN_LIMITS } from "@/features/billing/utils/plans"

export async function acceptInvitation(token: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
    },
  })

  if (!currentUser?.email) {
    throw new Error("User email not found")
  }

  const invitation = await prisma.invitation.findUnique({
    where: {
      token,
    },
  })

  if (!invitation) {
    throw new Error("Invitation not found")
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation expired")
  }

  if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("This invitation belongs to a different email address")
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: invitation.workspaceId,
      },
    },
  })

  if (existingMembership) {
    throw new Error("You are already a member of this workspace")
  }

  const subscription = await getWorkspaceSubscription(invitation.workspaceId)

  if (!subscription?.active) {
    throw new Error("Workspace subscription is inactive")
  }

  const memberCount = await prisma.membership.count({
    where: {
      workspaceId: invitation.workspaceId,
    },
  })

  if (
    memberCount >= PLAN_LIMITS[subscription.plan].members
  ) {
    throw new Error("Member limit reached. Upgrade required.")
  }

  await prisma.$transaction([
    prisma.membership.create({
      data: {
        userId: session.user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    }),
    prisma.invitation.delete({
      where: {
        id: invitation.id,
      },
    }),
  ])

  revalidatePath("/dashboard")
  revalidatePath(`/invitations/${token}`)

  return {
    success: true,
  }
}
