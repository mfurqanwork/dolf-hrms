import { useTranslation } from "react-i18next"
import { Globe, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-8">
      <PageHeader
        title={t("common.settings")}
        breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t("common.settings") }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <User className="size-5" />
              {t("common.profile")}
            </CardTitle>
            <CardDescription>{user?.full_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-14 bg-[#f97316] text-white">
                <AvatarFallback className="bg-[#f97316] text-lg font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("common.email")}: </span>
                  <span className="font-medium">{user?.email}</span>
                </p>
                <Badge variant="secondary" className="text-sm">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <Globe className="size-5" />
              {t("common.language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>{t("common.language")}</FieldLabel>
                <FieldContent className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant={i18n.language === "en" ? "default" : "outline"}
                    className="min-w-[7rem]"
                    onClick={() => void i18n.changeLanguage("en")}
                  >
                    English
                  </Button>
                  <Button
                    size="lg"
                    variant={i18n.language === "ar" ? "default" : "outline"}
                    className="min-w-[7rem]"
                    onClick={() => void i18n.changeLanguage("ar")}
                  >
                    العربية
                  </Button>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">Dolf Technologies — Saudi Arabia</p>
    </div>
  )
}
