import { Link } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import type { TFunction } from "i18next"
import { Eye } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { BoolBadge } from "@/components/shared/BoolBadge"
import type { Employee } from "@/lib/types"
import { isEmployeeActive } from "@/lib/employee"

export interface GetEmployeeColumnsOptions {
  currentUserId?: string
  isAdmin: boolean
}

export function getEmployeeColumns(
  t: TFunction,
  { currentUserId, isAdmin }: GetEmployeeColumnsOptions,
): ColumnDef<Employee>[] {
  return [
    {
      id: "employee",
      accessorFn: (row) => `${row.first_name} ${row.last_name} ${row.email}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.employee")} />
      ),
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 bg-[#f97316] text-white">
              <AvatarFallback className="bg-[#f97316] text-sm font-semibold text-white">
                {employee.avatar_initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "job_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.jobTitle")} />
      ),
      cell: ({ row }) => row.getValue("job_title") ?? "—",
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.department")} />
      ),
      cell: ({ row }) => row.getValue("department") ?? "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => (
        <BoolBadge
          value={isEmployeeActive(row.original.status)}
          trueKey="common.active"
          falseKey="common.inactive"
        />
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <div className="text-end">{t("common.actions")}</div>,
      cell: ({ row }) => {
        const employee = row.original
        const canView =
          isAdmin || (currentUserId != null && employee.user_id === currentUserId)
        if (!canView) return null
        return (
          <div className="text-end">
            <Link to={`/employees/${employee.id}`}>
              <Button variant="outline" size="lg">
                <Eye />
                {t("common.view")}
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]
}
