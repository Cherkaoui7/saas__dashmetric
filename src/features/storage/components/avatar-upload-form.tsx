"use client"

import { ImageUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useRef, useState, useTransition } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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

import { uploadUserAvatar } from "@/features/storage/actions/upload-user-avatar"

interface AvatarUploadFormProps {
  currentImageUrl?: string | null
  displayName: string
}

export function AvatarUploadForm({
  currentImageUrl,
  displayName,
}: AvatarUploadFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        await uploadUserAvatar(formData)
        formRef.current?.reset()
        router.refresh()
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to update avatar."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Profile avatar</CardTitle>
        <CardDescription>
          Upload a small image for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {currentImageUrl ? (
                <AvatarImage src={currentImageUrl} alt={displayName} />
              ) : null}
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, or WebP
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-avatar">Avatar image</Label>
            <Input
              id="user-avatar"
              name="file"
              type="file"
              accept="image/gif,image/jpeg,image/png,image/webp,.gif,.jpeg,.jpg,.png,.webp"
              disabled={isPending}
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            <ImageUp />
            {isPending ? "Uploading..." : "Update avatar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
