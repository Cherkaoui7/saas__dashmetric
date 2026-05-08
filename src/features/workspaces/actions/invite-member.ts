"use server"

import crypto from "crypto"

import { WorkspaceRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { canManageWorkspace } from "@/features/auth/utils/permissions"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

const invitibleRoles = new Set<WorkspaceRole>(["ADMIN", "MEMBER"])

export async function inviteMember(
  email: string,
  role: WorkspaceRole
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership || !canManageWorkspace(membership.role)) {
    throw new Error("Forbidden")
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error("Email is required")
  }

  if (!invitibleRoles.has(role)) {
    throw new Error("Invalid role")
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
    },
  })

  if (currentUser?.email?.toLowerCase() === normalizedEmail) {
    throw new Error("You are already a member of this workspace")
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  })

  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: existingUser.id,
          workspaceId: membership.workspaceId,
        },
      },
    })

    if (existingMembership) {
      throw new Error("User is already a member of this workspace")
    }
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      workspaceId: membership.workspaceId,
      email: normalizedEmail,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (existingInvitation) {
    if (existingInvitation.expiresAt > new Date()) {
      throw new Error("An active invitation already exists for this email")
    }

    await prisma.invitation.delete({
      where: {
        id: existingInvitation.id,
      },
    })
  }

  const invitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      role,
      token: crypto.randomUUID(),
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7
      ),
      workspaceId: membership.workspaceId,
      invitedById: session.user.id,
    },
  })

  revalidatePath("/dashboard")

  return invitation
}
