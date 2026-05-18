import { Button } from "@react-email/components"

interface EmailButtonProps {
  href: string
  label: string
}

const buttonStyle = {
  backgroundColor: "#111827",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  marginTop: "12px",
  padding: "12px 18px",
  textDecoration: "none",
}

export function EmailButton({
  href,
  label,
}: EmailButtonProps) {
  return (
    <Button href={href} style={buttonStyle}>
      {label}
    </Button>
  )
}
