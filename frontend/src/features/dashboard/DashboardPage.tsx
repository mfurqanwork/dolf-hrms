import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatCardsSkeleton } from "@/components/shared/LoadingState";
import { useDashboardStats } from "@/hooks/useHrmsApi";

export function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardStats();

  const cards = [
    {
      label: t("common.employeeCount"),
      value: data?.employee_count ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: t("common.pendingRequests"),
      value: data?.pending_requests ?? 0,
      icon: ClipboardList,
      color: "text-amber-500",
    },
    {
      label: t("common.approvedRequests"),
      value: data?.approved_requests ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: t("common.rejectedRequests"),
      value: data?.rejected_requests ?? 0,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("common.dashboard")}
        description={t("common.welcome")}
      />

      {isLoading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon, color }) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              icon={icon}
              iconClassName={color}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("common.employees")}</CardTitle>
            <CardDescription>Dolf Technologies — Saudi Arabia</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <Link to="/employees">
                {t("common.view")} {t("common.employees").toLowerCase()}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("common.requests")}</CardTitle>
            <CardDescription>
              {t("common.document")} / {t("common.shift")} /{" "}
              {t("common.workType")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <Link to="/requests">
                {t("common.view")} {t("common.requests").toLowerCase()}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
