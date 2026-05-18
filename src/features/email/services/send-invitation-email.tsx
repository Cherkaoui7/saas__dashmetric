import { InvitationEmail } from "@/features/email/templates/invitation-email"
import { getAppUrl } from "@/features/email/utils/get-app-url"
import { sendEmail } from "@/features/email/services/send-email"

interface SendInvitationEmailParams {
  invitationToken: string
  inviterEmail: string
  recipientEmail: string
  role: string
  workspaceName: string
}

export async function sendInvitationEmail({
  invitationToken,
  inviterEmail,
  recipientEmail,
  role,
  workspaceName,
}: SendInvitationEmailParams) {
  const inviteUrl = `${getAppUrl()}/invitations/${invitationToken}`

  return sendEmail({
    idempotencyKey: `invitation:${invitationToken}`,
    react: (
      <InvitationEmail
        inviterEmail={inviterEmail}
        inviteUrl={inviteUrl}
        role={role}
        workspaceName={workspaceName}
      />
    ),
    subject: `You are invited to join ${workspaceName}`,
    text: `${inviterEmail} invited you to join ${workspaceName}. Accept the invitation: ${inviteUrl}`,
    to: recipientEmail,
  })
}
