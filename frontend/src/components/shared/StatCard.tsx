import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  iconClassName?: string
  isLoading?: boolean
}

export function StatCard({ label, value, icon: Icon, iconClassName, isLoading }: StatCardProps) {
  return (
    <Card className="border-border/80 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
          <Icon className={`size-5 ${iconClassName ?? "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="font-heading text-4xl font-semibold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
