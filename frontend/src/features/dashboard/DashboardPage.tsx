import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowRight, Users, ClipboardList, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatCardsSkeleton } from "@/components/shared/LoadingState"
import { useDashboardStats } from "@/hooks/useHrmsApi"

export function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useDashboardStats()

  const cards = [
    { label: t("common.employeeCount"), value: data?.employee_count ?? 0, icon: Users, color: "text-primary" },
    { label: t("common.pendingRequests"), value: data?.pending_requests ?? 0, icon: ClipboardList, color: "text-amber-500" },
    { label: t("common.approvedRequests"), value: data?.approved_requests ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: t("common.rejectedRequests"), value: data?.rejected_requests ?? 0, icon: XCircle, color: "text-red-500" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.dashboard")}
        description={t("common.welcome")}
        breadcrumbs={[{ label: t("common.dashboard") }]}
      />

      {isLoading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon, color }) => (
            <StatCard key={label} label={label} value={value} icon={icon} iconClassName={color} />
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="flex flex-col border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">{t("common.employees")}</CardTitle>
            <CardDescription>Dolf Technologies — Saudi Arabia</CardDescription>
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <Link to="/employees" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full gap-2 sm:min-w-[12rem]">
                {t("common.view")} {t("common.employees").toLowerCase()}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">{t("common.requests")}</CardTitle>
            <CardDescription>
              {t("common.document")} / {t("common.shift")} / {t("common.workType")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <Link to="/requests" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 sm:min-w-[12rem]">
                {t("common.view")} {t("common.requests").toLowerCase()}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
