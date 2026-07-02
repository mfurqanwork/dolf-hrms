import { useTranslation } from "react-i18next"
import { CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BoolBadgeProps {
  value: boolean
  trueLabel?: string
  falseLabel?: string
  trueKey?: string
  falseKey?: string
  className?: string
}

export function BoolBadge({
  value,
  trueLabel,
  falseLabel,
  trueKey,
  falseKey,
  className,
}: BoolBadgeProps) {
  const { t } = useTranslation()

  const trueText = trueKey ? t(trueKey) : trueLabel || t("common.enabled")
  const falseText = falseKey ? t(falseKey) : falseLabel || t("common.disabled")

  const label = value ? trueText : falseText
  const Icon = value ? CheckCircle2 : XCircle

  return (
    <Badge variant={value ? "success" : "error"} className={className}>
      <Icon />
      {label}
    </Badge>
  )
}
