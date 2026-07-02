import type { LucideIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <Alert>
      {Icon && <Icon />}
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}
