import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

interface EmailShellProps {
  children: ReactNode
  preview: string
  title: string
}

const bodyStyle = {
  backgroundColor: "#f6f7f9",
  color: "#111827",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: "32px 16px",
}

const containerStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
}

const headingStyle = {
  fontSize: "24px",
  lineHeight: "32px",
  margin: "0 0 16px",
}

const footerStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  marginTop: "32px",
}

export function EmailShell({
  children,
  preview,
  title,
}: EmailShellProps) {
  return (
    <Html>
      <Head />

      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text
            style={{
              display: "none",
              maxHeight: 0,
              overflow: "hidden",
            }}
          >
            {preview}
          </Text>

          <Heading style={headingStyle}>
            {title}
          </Heading>

          <Section>{children}</Section>

          <Text style={footerStyle}>
            DashMetrics sends this transactional email for your account
            and workspace activity.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
