import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} {t("common.rowsTotal")}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t("common.rowsPerPage")}</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-10 w-[5.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {t("common.page")} {table.getState().pagination.pageIndex + 1} {t("common.of")}{" "}
            {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="rtl:rotate-180" />
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("common.next")}
              <ChevronRight className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
