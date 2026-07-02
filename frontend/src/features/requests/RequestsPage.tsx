import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { TableSkeleton } from "@/components/shared/LoadingState"
import {
  useApproveRequest,
  useCreateRequest,
  useRejectRequest,
  useRequests,
} from "@/hooks/useHrmsApi"
import { useAuthStore } from "@/stores/authStore"
import type { RequestType } from "@/lib/types"

const statusVariant = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const

export function RequestsPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "super_admin" || user?.role === "company_admin"
  const { data = [], isLoading } = useRequests()
  const createRequest = useCreateRequest()
  const approveRequest = useApproveRequest()
  const rejectRequest = useRejectRequest()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requestType, setRequestType] = useState<RequestType>("document")

  const handleCreate = async () => {
    try {
      await createRequest.mutateAsync({ request_type: requestType, title, description })
      toast.success(t("common.submitRequest"))
      setOpen(false)
      setTitle("")
      setDescription("")
    } catch {
      toast.error("Failed to create request")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <PageHeader
            title={t("common.requests")}
            description={`${t("common.document")} / ${t("common.shift")} / ${t("common.workType")}`}
            breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t("common.requests") }]}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="shrink-0">{t("common.newRequest")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("common.newRequest")}</DialogTitle>
              <DialogDescription>{t("common.submitRequest")}</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>{t("common.type")}</FieldLabel>
                <FieldContent>
                  <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">{t("common.document")}</SelectItem>
                      <SelectItem value="shift">{t("common.shift")}</SelectItem>
                      <SelectItem value="work_type">{t("common.workType")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>{t("common.title")}</FieldLabel>
                <FieldContent>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>{t("common.description")}</FieldLabel>
                <FieldContent>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>{t("common.description")}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={!title || createRequest.isPending}>
                {t("common.submitRequest")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("common.requests")}</CardTitle>
          <CardDescription>{data.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <EmptyState title={t("common.noData")} description={t("common.newRequest")} icon={ClipboardList} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.title")}</TableHead>
                  <TableHead>{t("common.employee")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  {isAdmin && <TableHead className="text-end">{t("common.actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">{request.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.employee_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`common.${request.request_type === "work_type" ? "workType" : request.request_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[request.status]}>{t(`common.${request.status}`)}</Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-end">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveRequest.mutate(request.id)}
                              disabled={approveRequest.isPending}
                            >
                              {t("common.approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectRequest.mutate(request.id)}
                              disabled={rejectRequest.isPending}
                            >
                              {t("common.reject")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
