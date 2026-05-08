import { WorkspaceRole } from "@prisma/client"

export function canManageWorkspace(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN"
}

export function isWorkspaceOwner(role: WorkspaceRole) {
  return role === "OWNER"
}
