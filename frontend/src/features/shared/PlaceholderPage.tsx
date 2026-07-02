import { useTranslation } from "react-i18next"
import { Construction } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(`common.${titleKey}`)}
        breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t(`common.${titleKey}`) }]}
      />
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t(`common.${titleKey}`)}</CardTitle>
          <CardDescription>{t("common.comingSoon")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Construction />
            <AlertTitle>{t("common.comingSoon")}</AlertTitle>
            <AlertDescription>
              {t(`common.${titleKey}`)} — Dolf Technologies HRMS
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
