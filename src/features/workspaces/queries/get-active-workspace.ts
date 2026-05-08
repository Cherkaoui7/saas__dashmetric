import { getActiveWorkspaceMembership } from "@/features/workspaces/queries/get-active-workspace-membership"

export async function getActiveWorkspace(userId: string) {
  const membership = await getActiveWorkspaceMembership(userId)

  return membership?.workspace ?? null
}
