import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useEmployees } from "@/hooks/useHrmsApi";
import { getEmployeeColumns } from "@/features/employees/columns";

export function EmployeesPage() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useEmployees();
  const columns = useMemo(() => getEmployeeColumns(t), [t]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.employees")}
        description="Dolf Technologies — Saudi Arabia"
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/" },
          { label: t("common.employees") },
        ]}
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            {t("common.employees")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          {!isLoading && data.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState
                title={t("common.noData")}
                description={t("common.comingSoon")}
                icon={Users}
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              searchKey="employee"
              searchPlaceholder={t("common.searchEmployees")}
              emptyMessage={t("common.noData")}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
