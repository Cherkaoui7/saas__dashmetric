"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState, useTransition } from "react"

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

import { createMetric } from "@/features/dashboard/actions/create-metric"

export function CreateMetricForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await createMetric({
          title,
          value: Number(value),
        })

        setTitle("")
        setValue("")
        router.refresh()
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to save metric."
        )
      }
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Add metric</CardTitle>
        <CardDescription>
          Create workspace-owned metrics for your dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric-title">Title</Label>
            <Input
              id="metric-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Revenue"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-value">Value</Label>
            <Input
              id="metric-value"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="1200"
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Create metric"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
