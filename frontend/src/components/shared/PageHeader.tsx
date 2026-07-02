import { Link } from "react-router-dom"
import { Fragment, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

export interface BreadcrumbItemConfig {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemConfig[]
  actions?: ReactNode
  backHref?: string
  backLabel?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backHref,
  backLabel,
}: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="mb-8 space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink render={<Link to={item.href} />}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-base text-muted-foreground">{description}</p>}
        </div>
        {(backHref || actions) && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 lg:ms-auto">
            {backHref && (
              <Button variant="outline" size="lg" render={<Link to={backHref} />}>
                <ArrowLeft className="rtl:rotate-180" />
                {backLabel ?? t("common.back")}
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
