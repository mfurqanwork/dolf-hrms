import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { AttendancePanelSkeleton } from "@/components/shared/LoadingState"
import { useAttendance, useAttendanceChart } from "@/hooks/useHrmsApi"
import { daysAgoIso, todayIso } from "@/lib/datetime"
import { AttendanceHoursChart } from "@/features/attendance/AttendanceHoursChart"
import { getAttendanceColumns } from "@/features/attendance/columns"

interface EmployeeAttendancePanelProps {
  employeeId: string
}

export function EmployeeAttendancePanel({ employeeId }: EmployeeAttendancePanelProps) {
  const { t } = useTranslation()
  const queryParams = useMemo(
    () => ({
      from_date: daysAgoIso(30),
      to_date: todayIso(),
      employee_id: employeeId,
    }),
    [employeeId],
  )

  const { data: records = [], isLoading } = useAttendance(queryParams)
  const { data: chartData, isLoading: chartLoading } = useAttendanceChart(queryParams)
  const columns = useMemo(() => getAttendanceColumns({ t, showEmployee: false }), [t])

  if (isLoading && chartLoading) {
    return <AttendancePanelSkeleton />
  }

  return (
    <div className="space-y-6">
      <AttendanceHoursChart data={chartData} isLoading={chartLoading} />
      <Card>
        <CardHeader>
          <CardTitle>{t("common.attendanceRecords")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <DataTable
            columns={columns}
            data={records}
            emptyMessage={t("common.noData")}
            isLoading={isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}
