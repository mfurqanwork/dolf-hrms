import { useTranslation } from "react-i18next"
import { Globe, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAuthStore } from "@/stores/authStore"

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DT"

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("common.settings")}
        breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t("common.settings") }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            {t("common.profile")}
          </CardTitle>
          <CardDescription>{user?.full_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-14 bg-accent text-accent-foreground">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t("common.email")}: </span>
                {user?.email}
              </p>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-4" />
            {t("common.language")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="max-w-xs">
            <Field>
              <FieldLabel>{t("common.language")}</FieldLabel>
              <FieldContent className="flex gap-2">
                <Button
                  variant={i18n.language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => void i18n.changeLanguage("en")}
                >
                  English
                </Button>
                <Button
                  variant={i18n.language === "ar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => void i18n.changeLanguage("ar")}
                >
                  العربية
                </Button>
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-sm text-muted-foreground">Dolf Technologies — Saudi Arabia</p>
    </div>
  )
}
