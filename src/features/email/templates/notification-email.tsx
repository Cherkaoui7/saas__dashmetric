import { Text } from "@react-email/components"

import { EmailButton } from "@/features/email/components/email-button"
import { EmailShell } from "@/features/email/components/email-shell"

interface NotificationEmailProps {
  actionUrl?: string
  message: string
  title: string
}

const textStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
}

export function NotificationEmail({
  actionUrl,
  message,
  title,
}: NotificationEmailProps) {
  return (
    <EmailShell preview={message} title={title}>
      <Text style={textStyle}>
        {message}
      </Text>

      {actionUrl ? (
        <EmailButton href={actionUrl} label="Open DashMetrics" />
      ) : null}
    </EmailShell>
  )
}
