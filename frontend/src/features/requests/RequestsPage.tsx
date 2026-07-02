import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ClipboardList, Plus, Send, X } from "lucide-react"
import { toast } from "sonner"
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
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { DataTable } from "@/components/ui/data-table"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  useApproveRequest,
  useCreateRequest,
  useRejectRequest,
  useRequests,
} from "@/hooks/useHrmsApi"
import { useAuthStore } from "@/stores/authStore"
import type { RequestType } from "@/lib/types"
import { getRequestColumns } from "@/features/requests/columns"

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

  const columns = useMemo(
    () =>
      getRequestColumns({
        t,
        isAdmin,
        onApprove: (id) => approveRequest.mutate(id),
        onReject: (id) => rejectRequest.mutate(id),
        isActionPending: approveRequest.isPending || rejectRequest.isPending,
      }),
    [t, isAdmin, approveRequest, rejectRequest]
  )

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

  const newRequestDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="lg" className="min-w-40">
          <Plus />
          {t("common.newRequest")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("common.newRequest")}</DialogTitle>
          <DialogDescription>{t("common.submitRequest")}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>{t("common.type")}</FieldLabel>
            <FieldContent>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                <SelectTrigger className="h-11 w-full">
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
              <Input className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>{t("common.description")}</FieldLabel>
            <FieldContent>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              <FieldDescription>{t("common.description")}</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
        <DialogFooter className="gap-3 sm:gap-3">
          <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
            <X />
            {t("common.cancel")}
          </Button>
          <Button size="lg" onClick={handleCreate} disabled={!title || createRequest.isPending}>
            <Send />
            {t("common.submitRequest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("common.requests")}
        description={`${t("common.document")} / ${t("common.shift")} / ${t("common.workType")}`}
        breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t("common.requests") }]}
        actions={newRequestDialog}
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("common.requests")}</CardTitle>
          <CardDescription>{data.length} {t("common.rowsTotal")}</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          {!isLoading && data.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState title={t("common.noData")} description={t("common.newRequest")} icon={ClipboardList} />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              searchKey="title"
              searchPlaceholder={t("common.searchRequests")}
              emptyMessage={t("common.noData")}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
