"use client"

import { ImageUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { uploadWorkspaceLogo } from "@/features/storage/actions/upload-workspace-logo"

interface WorkspaceLogoUploadFormProps {
  canManageWorkspace: boolean
  currentLogoUrl?: string | null
  workspaceName: string
}

export function WorkspaceLogoUploadForm({
  canManageWorkspace,
  currentLogoUrl,
  workspaceName,
}: WorkspaceLogoUploadFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!canManageWorkspace) {
      setError("Only workspace owners and admins can update the logo.")
      return
    }

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        await uploadWorkspaceLogo(formData)
        formRef.current?.reset()
        router.refresh()
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to update workspace logo."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Workspace logo</CardTitle>
        <CardDescription>
          {canManageWorkspace
            ? "Upload an image for this workspace."
            : "Only admins and owners can update workspace branding."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm font-semibold">
              {currentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentLogoUrl}
                  alt={workspaceName}
                  className="size-full object-cover"
                />
              ) : (
                workspaceName.slice(0, 2).toUpperCase()
              )}
            </div>

            <p className="min-w-0 truncate text-sm font-medium">
              {workspaceName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-logo">Logo image</Label>
            <Input
              id="workspace-logo"
              name="file"
              type="file"
              accept="image/gif,image/jpeg,image/png,image/webp,.gif,.jpeg,.jpg,.png,.webp"
              disabled={!canManageWorkspace || isPending}
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={!canManageWorkspace || isPending}
          >
            <ImageUp />
            {isPending ? "Uploading..." : "Update logo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
