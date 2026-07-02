import type { ColumnDef } from "@tanstack/react-table"
import type { TFunction } from "i18next"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import type { HrRequest } from "@/lib/types"

const statusVariant = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const

interface RequestColumnOptions {
  t: TFunction
  isAdmin: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isActionPending: boolean
}

export function getRequestColumns({
  t,
  isAdmin,
  onApprove,
  onReject,
  isActionPending,
}: RequestColumnOptions): ColumnDef<HrRequest>[] {
  const columns: ColumnDef<HrRequest>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.title")} />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: "employee_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.employee")} />
      ),
      cell: ({ row }) => row.getValue("employee_name") ?? "—",
    },
    {
      accessorKey: "request_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.type")} />
      ),
      cell: ({ row }) => {
        const type = row.original.request_type
        const label = t(`common.${type === "work_type" ? "workType" : type}`)
        return <Badge variant="outline">{label}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return <Badge variant={statusVariant[status]}>{t(`common.${status}`)}</Badge>
      },
    },
  ]

  if (isAdmin) {
    columns.push({
      id: "actions",
      enableSorting: false,
      header: () => <div className="text-end">{t("common.actions")}</div>,
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <div className="flex justify-end gap-3">
            <Button size="lg" onClick={() => onApprove(row.original.id)} disabled={isActionPending}>
              <Check />
              {t("common.approve")}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => onReject(row.original.id)}
              disabled={isActionPending}
            >
              <X />
              {t("common.reject")}
            </Button>
          </div>
        ) : null,
    })
  }

  return columns
}
