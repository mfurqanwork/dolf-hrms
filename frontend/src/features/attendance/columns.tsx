import type { ColumnDef } from "@tanstack/react-table"
import type { TFunction } from "i18next"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { formatDateWithWeekday, formatTime } from "@/lib/datetime"
import type { AttendanceRecord } from "@/lib/types"

const statusVariant = {
  present: "success",
  late: "secondary",
  absent: "error",
  on_leave: "outline",
  half_day: "secondary",
} as const

interface AttendanceColumnOptions {
  t: TFunction
  showEmployee?: boolean
}

export function getAttendanceColumns({
  t,
  showEmployee = true,
}: AttendanceColumnOptions): ColumnDef<AttendanceRecord>[] {
  const columns: ColumnDef<AttendanceRecord>[] = []

  if (showEmployee) {
    columns.push({
      accessorKey: "employee_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.employee")} />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employee_name}</p>
          <p className="text-sm text-muted-foreground">{row.original.employee_code}</p>
        </div>
      ),
    })
  }

  columns.push(
    {
      accessorKey: "work_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.date")} />
      ),
      cell: ({ row }) => formatDateWithWeekday(row.original.work_date),
    },
    {
      id: "check_in",
      accessorFn: (row) => row.check_in,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.checkIn")} />
      ),
      cell: ({ row }) => formatTime(row.original.check_in),
    },
    {
      id: "check_out",
      accessorFn: (row) => row.check_out,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.checkOut")} />
      ),
      cell: ({ row }) => formatTime(row.original.check_out),
    },
    {
      accessorKey: "hours_worked",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.hoursWorked")} />
      ),
      cell: ({ row }) =>
        row.original.hours_worked != null ? `${row.original.hours_worked}h` : "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={statusVariant[status]}>{t(`common.${status}`)}</Badge>
        )
      },
    },
  )

  return columns
}
