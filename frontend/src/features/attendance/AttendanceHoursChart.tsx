import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatDateLabel } from "@/lib/datetime"
import type { AttendanceChartData } from "@/lib/types"
import { ChartSkeleton } from "@/components/shared/LoadingState"

const chartConfig = {
  hours: {
    label: "Hours",
    theme: {
      light: "#2563eb",
      dark: "#3b82f6",
    },
  },
} satisfies ChartConfig

interface AttendanceHoursChartProps {
  data?: AttendanceChartData
  isLoading?: boolean
  title?: string
  description?: string
}

export function AttendanceHoursChart({
  data,
  isLoading,
  title,
  description,
}: AttendanceHoursChartProps) {
  const { t } = useTranslation()

  const chartData = useMemo(
    () =>
      (data?.points ?? []).map((point) => ({
        label: formatDateLabel(point.work_date),
        workDate: point.work_date,
        hours: point.hours_worked,
        avgCheckIn: point.avg_check_in,
        avgCheckOut: point.avg_check_out,
        recordCount: point.record_count,
      })),
    [data?.points],
  )

  const tickInterval = useMemo(() => {
    if (chartData.length <= 10) return 0
    return Math.max(1, Math.floor(chartData.length / 8))
  }, [chartData.length])

  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {title ?? t("common.attendanceHours")}
        </CardTitle>
        <CardDescription>
          {description ??
            `${t("common.schedule")}: ${data?.schedule_start ?? "08:00"} – ${data?.schedule_end ?? "17:30"} · ${t("common.workingWeek")}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[20rem] items-center justify-center text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[20rem] w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={tickInterval}
                minTickGap={16}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => {
                      const item = payload?.[0]?.payload as { workDate?: string } | undefined
                      return item?.workDate ? formatDateLabel(item.workDate) : _label
                    }}
                    formatter={(value, _name, item) => (
                      <div className="flex flex-col gap-1">
                        <span>
                          {t("common.hoursWorked")}: {value}h
                        </span>
                        {item.payload.avgCheckIn && (
                          <span>
                            {t("common.checkIn")}: {item.payload.avgCheckIn}
                          </span>
                        )}
                        {item.payload.avgCheckOut && (
                          <span>
                            {t("common.checkOut")}: {item.payload.avgCheckOut}
                          </span>
                        )}
                      </div>
                    )}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="var(--color-hours)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-hours)", stroke: "var(--color-hours)" }}
                activeDot={{ r: 5, fill: "var(--color-hours)", stroke: "var(--color-hours)" }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
