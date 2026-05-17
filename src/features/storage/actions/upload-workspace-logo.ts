"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { createActivity } from "@/features/activity/services/create-activity"
import { canManageWorkspace } from "@/features/auth/utils/permissions"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"
import { uploadFile } from "@/features/storage/services/upload-file"
import {
  getFileType,
  validateImageFile,
} from "@/features/storage/utils/file-validation"

function getFormFile(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File)) {
    throw new Error("Logo image is required")
  }

  return file
}

export async function uploadWorkspaceLogo(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership || !canManageWorkspace(membership.role)) {
    throw new Error("Forbidden")
  }

  const file = getFormFile(formData)

  validateImageFile(file)

  const uploadedFile = await uploadFile(file)

  await prisma.$transaction([
    prisma.file.create({
      data: {
        name: file.name,
        url: uploadedFile.url,
        size: file.size,
        type: getFileType(file),
        workspaceId: membership.workspaceId,
        uploadedById: session.user.id,
      },
    }),
    prisma.workspace.update({
      where: {
        id: membership.workspaceId,
      },
      data: {
        logoUrl: uploadedFile.url,
      },
    }),
  ])

  await createActivity({
    type: "FILE_UPLOADED",
    message: `${session.user.email} updated the workspace logo`,
    workspaceId: membership.workspaceId,
    actorId: session.user.id,
  })

  revalidatePath("/dashboard")

  return {
    url: uploadedFile.url,
  }
}
