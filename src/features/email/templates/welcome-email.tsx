import { Text } from "@react-email/components"

import { EmailButton } from "@/features/email/components/email-button"
import { EmailShell } from "@/features/email/components/email-shell"

interface WelcomeEmailProps {
  dashboardUrl: string
  name: string
  workspaceName: string
}

const textStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
}

export function WelcomeEmail({
  dashboardUrl,
  name,
  workspaceName,
}: WelcomeEmailProps) {
  return (
    <EmailShell
      preview={`Welcome to DashMetrics. Your workspace ${workspaceName} is ready.`}
      title="Welcome to DashMetrics"
    >
      <Text style={textStyle}>
        Hi {name}, your workspace {workspaceName} is ready.
      </Text>

      <Text style={textStyle}>
        You can now invite teammates, track workspace metrics, upload files,
        and review analytics from your dashboard.
      </Text>

      <EmailButton href={dashboardUrl} label="Open dashboard" />
    </EmailShell>
  )
}
