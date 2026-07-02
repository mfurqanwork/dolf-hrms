import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function PageHeaderSkeleton({ withActions = false }: { withActions?: boolean }) {
  return (
    <header className="mb-8 space-y-4">
      <Skeleton className="h-4 w-48" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        {withActions && <Skeleton className="h-11 w-36 shrink-0" />}
      </div>
    </header>
  )
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  showSearch = true,
  showPagination = true,
}: {
  rows?: number
  columns?: number
  showSearch?: boolean
  showPagination?: boolean
}) {
  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="px-2">
          <Skeleton className="h-11 w-full max-w-sm" />
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border/80">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex items-center gap-4 px-4 py-4">
              {Array.from({ length: columns }).map((_, col) => (
                <Skeleton
                  key={col}
                  className={`h-4 flex-1 ${col === 0 ? "max-w-[12rem]" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {showPagination && (
        <div className="flex flex-col gap-4 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      )}
    </div>
  )
}

export function ChartSkeleton({ height = "20rem" }: { height?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1" style={{ height }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${30 + (i % 5) * 12}%` }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-10" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-10 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardLinksSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="flex flex-col border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-52" />
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <Skeleton className="h-11 w-full sm:w-48" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function FiltersSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full sm:w-48" />
      ))}
    </div>
  )
}

export function InfoListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between gap-4 px-4 py-3 ${i < rows - 1 ? "border-b" : ""}`}
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton withActions />
      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-44" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 shrink-0" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <InfoListSkeleton rows={5} />
        </CardContent>
      </Card>
    </div>
  )
}

export function AttendancePanelSkeleton() {
  return (
    <div className="space-y-6">
      <ChartSkeleton />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-44" />
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <TableSkeleton rows={8} columns={5} showSearch={false} />
        </CardContent>
      </Card>
    </div>
  )
}

export function CardTablePageSkeleton({
  columns = 5,
  rows = 8,
  showSearch = true,
}: {
  columns?: number
  rows?: number
  showSearch?: boolean
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-24" />
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
        <TableSkeleton rows={rows} columns={columns} showSearch={showSearch} />
      </CardContent>
    </Card>
  )
}
