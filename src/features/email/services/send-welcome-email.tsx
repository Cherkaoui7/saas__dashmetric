import { sendEmail } from "@/features/email/services/send-email"
import { WelcomeEmail } from "@/features/email/templates/welcome-email"
import { getAppUrl } from "@/features/email/utils/get-app-url"

interface SendWelcomeEmailParams {
  email: string
  name: string
  userId: string
  workspaceName: string
}

export async function sendWelcomeEmail({
  email,
  name,
  userId,
  workspaceName,
}: SendWelcomeEmailParams) {
  return sendEmail({
    idempotencyKey: `welcome:${userId}`,
    react: (
      <WelcomeEmail
        dashboardUrl={`${getAppUrl()}/dashboard`}
        name={name}
        workspaceName={workspaceName}
      />
    ),
    subject: "Welcome to DashMetrics",
    text: `Welcome to DashMetrics. Your workspace ${workspaceName} is ready: ${getAppUrl()}/dashboard`,
    to: email,
  })
}
