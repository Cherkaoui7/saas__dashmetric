import type { FileType } from "@prisma/client"
import { Download, FileText, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

import { formatFileSize } from "@/features/storage/utils/file-validation"

interface FileListProps {
  files: {
    id: string
    name: string
    url: string
    size: number
    type: FileType
    createdAt: Date
    uploadedBy: {
      email: string
      name: string | null
    }
  }[]
}

function getFileIcon(type: FileType) {
  if (type === "IMAGE") {
    return <ImageIcon className="text-sky-600" />
  }

  return <FileText className="text-muted-foreground" />
}

export function FileList({
  files,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">
            Uploaded workspace files will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                {getFileIcon(file.type)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {file.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                  {" "}
                  by
                  {" "}
                  {file.uploadedBy.name?.trim() || file.uploadedBy.email}
                  {" "}
                  on
                  {" "}
                  {file.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm">
              <a href={file.url} target="_blank" rel="noreferrer">
                <Download />
                Open
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
