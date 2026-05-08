import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  value: number
  description?: string
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">
          {numberFormatter.format(value)}
        </CardTitle>
      </CardHeader>

      {description ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      ) : null}
    </Card>
  )
}
