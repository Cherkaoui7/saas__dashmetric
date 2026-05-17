import crypto from "crypto"
import fs from "fs/promises"
import path from "path"

import { sanitizeFileName } from "@/features/storage/utils/file-validation"

const uploadDirectory = path.join(process.cwd(), "public", "uploads")

export async function uploadFile(file: File) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const uploadPath = path.join(uploadDirectory, fileName)

  await fs.mkdir(uploadDirectory, {
    recursive: true,
  })

  await fs.writeFile(uploadPath, buffer, {
    flag: "wx",
  })

  return {
    url: `/uploads/${fileName}`,
    key: fileName,
  }
}
