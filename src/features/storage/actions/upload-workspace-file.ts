"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

import { createActivity } from "@/features/activity/services/create-activity"
import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"
import { uploadFile } from "@/features/storage/services/upload-file"
import {
  getFileType,
  validateFile,
} from "@/features/storage/utils/file-validation"

function getFormFile(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File)) {
    throw new Error("File is required")
  }

  return file
}

export async function uploadWorkspaceFile(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const membership = await getActiveWorkspaceMembership(session.user.id)

  if (!membership) {
    throw new Error("No active workspace found.")
  }

  const file = getFormFile(formData)

  validateFile(file)

  const uploadedFile = await uploadFile(file)
  const workspaceFile = await prisma.file.create({
    data: {
      name: file.name,
      url: uploadedFile.url,
      size: file.size,
      type: getFileType(file),
      workspaceId: membership.workspaceId,
      uploadedById: session.user.id,
    },
  })

  await createActivity({
    type: "FILE_UPLOADED",
    message: `${session.user.email} uploaded ${file.name}`,
    workspaceId: membership.workspaceId,
    actorId: session.user.id,
  })

  revalidatePath("/dashboard")

  return workspaceFile
}
