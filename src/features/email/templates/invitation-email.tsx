import { Text } from "@react-email/components"

import { EmailButton } from "@/features/email/components/email-button"
import { EmailShell } from "@/features/email/components/email-shell"

interface InvitationEmailProps {
  inviterEmail: string
  inviteUrl: string
  role: string
  workspaceName: string
}

const textStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
}

const linkStyle = {
  color: "#2563eb",
  fontSize: "13px",
  lineHeight: "20px",
  wordBreak: "break-all" as const,
}

export function InvitationEmail({
  inviterEmail,
  inviteUrl,
  role,
  workspaceName,
}: InvitationEmailProps) {
  return (
    <EmailShell
      preview={`${inviterEmail} invited you to join ${workspaceName}.`}
      title="You have a workspace invitation"
    >
      <Text style={textStyle}>
        {inviterEmail} invited you to join {workspaceName} as {role}.
      </Text>

      <Text style={textStyle}>
        Accept the invitation to start collaborating with this workspace.
      </Text>

      <EmailButton href={inviteUrl} label="Accept invitation" />

      <Text style={linkStyle}>
        {inviteUrl}
      </Text>
    </EmailShell>
  )
}
