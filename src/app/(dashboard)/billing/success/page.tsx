import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BillingSuccessPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment submitted</CardTitle>
        <CardDescription>
          Stripe is confirming your subscription through the webhook pipeline.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your plan updates after Stripe sends the verified subscription event.
          This keeps billing state trustworthy even if redirects are interrupted.
        </p>

        <Button asChild>
          <Link href="/dashboard">
            Back to dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
