import type { FileType } from "@prisma/client"

export const MAX_FILE_SIZE = 5 * 1024 * 1024

const blockedExtensions = new Set([
  ".bat",
  ".cmd",
  ".com",
  ".exe",
  ".html",
  ".htm",
  ".jar",
  ".js",
  ".mjs",
  ".msi",
  ".php",
  ".ps1",
  ".scr",
  ".sh",
  ".svg",
  ".ts",
  ".tsx",
  ".vbs",
  ".wsf",
])

const blockedMimeTypes = new Set([
  "application/javascript",
  "application/x-msdownload",
  "image/svg+xml",
  "text/html",
])

const imageMimeTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
])

const documentMimeTypes = new Set([
  "application/json",
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "text/plain",
])

const allowedExtensions = new Set([
  ".csv",
  ".doc",
  ".docx",
  ".gif",
  ".jpeg",
  ".jpg",
  ".json",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".txt",
  ".webp",
  ".xls",
  ".xlsx",
])

const imageExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
])

const documentExtensions = new Set([
  ".csv",
  ".doc",
  ".docx",
  ".json",
  ".pdf",
  ".ppt",
  ".pptx",
  ".txt",
  ".xls",
  ".xlsx",
])

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".")

  if (dotIndex === -1) {
    return ""
  }

  return fileName.slice(dotIndex).toLowerCase()
}

export function sanitizeFileName(fileName: string) {
  const extension = getExtension(fileName)
  const baseName = extension
    ? fileName.slice(0, -extension.length)
    : fileName
  const safeBaseName = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return `${safeBaseName || "upload"}${extension}`
}

export function validateFile(file: File) {
  const extension = getExtension(file.name)

  if (file.size <= 0) {
    throw new Error("File is empty")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 5MB limit")
  }

  if (blockedExtensions.has(extension) || blockedMimeTypes.has(file.type)) {
    throw new Error("This file type is not allowed")
  }

  if (!allowedExtensions.has(extension)) {
    throw new Error("Unsupported file extension")
  }

  if (
    file.type &&
    !imageMimeTypes.has(file.type) &&
    !documentMimeTypes.has(file.type)
  ) {
    throw new Error("Unsupported file type")
  }

  return true
}

export function validateImageFile(file: File) {
  validateFile(file)

  const extension = getExtension(file.name)

  if (!imageMimeTypes.has(file.type) && !imageExtensions.has(extension)) {
    throw new Error("Only image files are allowed")
  }

  return true
}

export function getFileType(file: File): FileType {
  const extension = getExtension(file.name)

  if (imageMimeTypes.has(file.type) || imageExtensions.has(extension)) {
    return "IMAGE"
  }

  if (
    documentMimeTypes.has(file.type) ||
    documentExtensions.has(extension)
  ) {
    return "DOCUMENT"
  }

  return "OTHER"
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
