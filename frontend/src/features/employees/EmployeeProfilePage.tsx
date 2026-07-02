import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BoolBadge } from "@/components/shared/BoolBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { InfoList } from "@/components/shared/InfoList"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProfileSkeleton } from "@/components/shared/LoadingState"
import { useEmployee } from "@/hooks/useHrmsApi"
import { isEmployeeActive } from "@/lib/employee"

export function EmployeeProfilePage() {
  const { id = "" } = useParams()
  const { t } = useTranslation()
  const { data: employee, isLoading } = useEmployee(id)

  if (isLoading) return <ProfileSkeleton />
  if (!employee) {
    return <EmptyState title={t("common.noData")} description={t("common.employee")} />
  }

  const fullName = `${employee.first_name} ${employee.last_name}`

  return (
    <div className="space-y-8">
      <PageHeader
        title={fullName}
        description={employee.job_title ?? undefined}
        backHref="/employees"
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/" },
          { label: t("common.employees"), href: "/employees" },
          { label: fullName },
        ]}
      />

      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center">
          <Avatar className="size-24 bg-[#f97316] text-2xl text-white">
            <AvatarFallback className="bg-[#f97316] text-2xl font-semibold text-white">
              {employee.avatar_initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-semibold">{fullName}</h2>
            <CardDescription>{employee.email}</CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{employee.employee_code}</Badge>
              <Badge variant="secondary">{employee.department}</Badge>
              <BoolBadge
                value={isEmployeeActive(employee.status)}
                trueKey="common.active"
                falseKey="common.inactive"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList variant="line" className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="personal" className="px-4 py-2.5 text-sm">
            {t("common.personalInfo")}
          </TabsTrigger>
          <TabsTrigger value="work" className="px-4 py-2.5 text-sm">
            {t("common.workInfo")}
          </TabsTrigger>
          <TabsTrigger value="contract" className="px-4 py-2.5 text-sm">
            {t("common.contract")}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="px-4 py-2.5 text-sm">
            {t("common.attendance")}
          </TabsTrigger>
          <TabsTrigger value="leave" className="px-4 py-2.5 text-sm">
            {t("common.leave")}
          </TabsTrigger>
          <TabsTrigger value="payroll" className="px-4 py-2.5 text-sm">
            {t("common.payrollStubs")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoList
                items={[
                  { label: t("common.email"), value: employee.email },
                  { label: t("common.phone"), value: employee.phone },
                  { label: t("common.nationality"), value: employee.nationality },
                  { label: t("common.address"), value: employee.address },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.workInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoList
                items={[
                  { label: t("common.jobTitle"), value: employee.job_title },
                  { label: t("common.department"), value: employee.department },
                  { label: t("common.manager"), value: employee.manager_name },
                  { label: t("common.workTypeLabel"), value: employee.work_type },
                  { label: t("common.shiftLabel"), value: employee.shift },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.contract")}</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.contract ? (
                <InfoList
                  items={[
                    { label: t("common.contractType"), value: employee.contract.contract_type },
                    { label: t("common.startDate"), value: employee.contract.start_date },
                    {
                      label: t("common.salary"),
                      value: employee.contract.salary
                        ? `${employee.contract.salary} ${employee.contract.currency}`
                        : null,
                    },
                  ]}
                />
              ) : (
                <EmptyState title={t("common.noData")} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {["attendance", "leave", "payroll"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Alert>
              <Clock />
              <AlertTitle>{t("common.comingSoon")}</AlertTitle>
              <AlertDescription>{t(`common.${tab === "payroll" ? "payrollStubs" : tab}`)}</AlertDescription>
            </Alert>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
