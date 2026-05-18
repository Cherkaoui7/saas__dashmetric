import { sendEmail } from "@/features/email/services/send-email"
import { NotificationEmail } from "@/features/email/templates/notification-email"
import { getAppUrl } from "@/features/email/utils/get-app-url"

interface SendNotificationEmailParams {
  idempotencyKey?: string
  message: string
  subject: string
  to: string
}

export async function sendNotificationEmail({
  idempotencyKey,
  message,
  subject,
  to,
}: SendNotificationEmailParams) {
  const actionUrl = `${getAppUrl()}/dashboard`

  return sendEmail({
    idempotencyKey,
    react: (
      <NotificationEmail
        actionUrl={actionUrl}
        message={message}
        title={subject}
      />
    ),
    subject,
    text: `${message} Open DashMetrics: ${actionUrl}`,
    to,
  })
}
