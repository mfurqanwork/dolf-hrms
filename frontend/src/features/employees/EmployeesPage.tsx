import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/LoadingState";
import { useEmployees } from "@/hooks/useHrmsApi";

export function EmployeesPage() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useEmployees();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("common.employees")}
        description="Dolf Technologies — Saudi Arabia"
        breadcrumbs={[
          { label: t("common.dashboard"), href: "/" },
          { label: t("common.employees") },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("common.employees")}</CardTitle>
          <CardDescription>
            {data.length} {t("common.employeeCount").toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <EmptyState
              title={t("common.noData")}
              description={t("common.comingSoon")}
              icon={Users}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.employee")}</TableHead>
                  <TableHead>{t("common.jobTitle")}</TableHead>
                  <TableHead>{t("common.department")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-end">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-accent text-accent-foreground">
                          <AvatarFallback>
                            {employee.avatar_initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.job_title}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{employee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm">
                        <Link to={`/employees/${employee.id}`}>
                          {t("common.view")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
