import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AnalyticsCardProps {
  title: string
  value: string | number
}

export function AnalyticsCard({
  title,
  value,
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">
          {value}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Derived from workspace metrics.
        </p>
      </CardContent>
    </Card>
  )
}
