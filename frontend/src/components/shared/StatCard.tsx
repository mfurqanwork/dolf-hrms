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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`size-4 ${iconClassName ?? "text-primary"}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  )
}
