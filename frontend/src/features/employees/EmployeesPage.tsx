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
import { CardTablePageSkeleton } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useEmployees } from "@/hooks/useHrmsApi";
import { getEmployeeColumns } from "@/features/employees/columns";
import { useAuthStore } from "@/stores/authStore";
import { isAdminRole } from "@/lib/auth";

export function EmployeesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminRole(user?.role);
  const { data = [], isLoading } = useEmployees();
  const columns = useMemo(
    () => getEmployeeColumns(t, { currentUserId: user?.id, isAdmin }),
    [t, user?.id, isAdmin],
  );

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

      {isLoading ? (
        <CardTablePageSkeleton columns={5} rows={8} />
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              {t("common.employees")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            {data.length === 0 ? (
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
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
