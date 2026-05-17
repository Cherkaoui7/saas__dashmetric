"use client"

import { Upload } from "lucide-react"
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

import { uploadWorkspaceFile } from "@/features/storage/actions/upload-workspace-file"

interface FileUploadFormProps {
  canUploadFiles: boolean
}

export function FileUploadForm({
  canUploadFiles,
}: FileUploadFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!canUploadFiles) {
      setError("You must be a workspace member to upload files.")
      return
    }

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        await uploadWorkspaceFile(formData)
        formRef.current?.reset()
        setSuccess("File uploaded.")
        router.refresh()
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to upload file."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Upload file</CardTitle>
        <CardDescription>
          Add images or documents to this workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="workspace-file">File</Label>
            <Input
              id="workspace-file"
              name="file"
              type="file"
              accept=".csv,.doc,.docx,.gif,.jpeg,.jpg,.json,.pdf,.png,.ppt,.pptx,.txt,.webp,.xls,.xlsx,image/gif,image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,application/json"
              disabled={!canUploadFiles || isPending}
              required
            />
          </div>

          {success ? (
            <p className="text-sm text-muted-foreground">
              {success}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={!canUploadFiles || isPending}
          >
            <Upload />
            {isPending ? "Uploading..." : "Upload file"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
