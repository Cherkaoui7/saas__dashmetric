"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { uploadFile } from "@/features/storage/services/upload-file"
import { validateImageFile } from "@/features/storage/utils/file-validation"

function getFormFile(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File)) {
    throw new Error("Avatar image is required")
  }

  return file
}

export async function uploadUserAvatar(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const file = getFormFile(formData)

  validateImageFile(file)

  const uploadedFile = await uploadFile(file)

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: uploadedFile.url,
    },
  })

  revalidatePath("/dashboard")

  return {
    url: uploadedFile.url,
  }
}
