import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/PageHeader"
import { CardTablePageSkeleton } from "@/components/shared/LoadingState"
import { useAttendance, useAttendanceChart, useEmployees } from "@/hooks/useHrmsApi"
import { daysAgoIso, todayIso } from "@/lib/datetime"
import { AttendanceHoursChart } from "@/features/attendance/AttendanceHoursChart"
import { getAttendanceColumns } from "@/features/attendance/columns"

export function AttendancePage() {
  const { t } = useTranslation()
  const [employeeId, setEmployeeId] = useState<string>("all")
  const [rangeDays, setRangeDays] = useState("30")

  const queryParams = useMemo(
    () => ({
      from_date: daysAgoIso(Number(rangeDays)),
      to_date: todayIso(),
      ...(employeeId !== "all" ? { employee_id: employeeId } : {}),
    }),
    [employeeId, rangeDays],
  )

  const { data: employees = [], isLoading: employeesLoading } = useEmployees()
  const { data: records = [], isLoading } = useAttendance(queryParams)
  const { data: chartData, isLoading: chartLoading } = useAttendanceChart(queryParams)
  const columns = useMemo(() => getAttendanceColumns({ t, showEmployee: true }), [t])
  const isInitialLoading = employeesLoading || (isLoading && chartLoading)

  const selectedEmployeeLabel = useMemo(() => {
    if (employeeId === "all") return t("common.allEmployees")
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.first_name} ${employee.last_name}` : t("common.allEmployees")
  }, [employeeId, employees, t])

  const selectedRangeLabel = useMemo(() => {
    const labels: Record<string, string> = {
      "30": t("common.last30Days"),
      "45": t("common.last45Days"),
      "60": t("common.last60Days"),
    }
    return labels[rangeDays] ?? t("common.last30Days")
  }, [rangeDays, t])

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.attendance")}
        description={`${t("common.schedule")}: 08:00 – 17:30 · ${t("common.workingWeek")}`}
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/" },
          { label: t("common.attendance") },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select value={employeeId} onValueChange={(v) => v && setEmployeeId(v)}>
          <SelectTrigger className="h-11 w-full sm:w-[16rem]">
            <SelectValue placeholder={t("common.allEmployees")}>
              {selectedEmployeeLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" label={t("common.allEmployees")}>
              {t("common.allEmployees")}
            </SelectItem>
            {employees.map((emp) => (
              <SelectItem
                key={emp.id}
                value={emp.id}
                label={`${emp.first_name} ${emp.last_name}`}
              >
                {emp.first_name} {emp.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rangeDays} onValueChange={(v) => v && setRangeDays(v)}>
          <SelectTrigger className="h-11 w-full sm:w-[12rem]">
            <SelectValue>{selectedRangeLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30" label={t("common.last30Days")}>
              {t("common.last30Days")}
            </SelectItem>
            <SelectItem value="45" label={t("common.last45Days")}>
              {t("common.last45Days")}
            </SelectItem>
            <SelectItem value="60" label={t("common.last60Days")}>
              {t("common.last60Days")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isInitialLoading ? (
        <>
          <AttendanceHoursChart isLoading />
          <CardTablePageSkeleton columns={6} rows={10} />
        </>
      ) : (
        <>
          <AttendanceHoursChart data={chartData} isLoading={chartLoading} />

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <CalendarClock className="size-5 text-primary" />
                {t("common.attendanceRecords")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
              <DataTable
                columns={columns}
                data={records}
                searchKey="employee_name"
                searchPlaceholder={t("common.searchEmployees")}
                emptyMessage={t("common.noData")}
                isLoading={isLoading}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
