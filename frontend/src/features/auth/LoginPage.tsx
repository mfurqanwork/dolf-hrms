import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useLogin } from "@/hooks/useHrmsApi"
import { api } from "@/lib/api"
import { brandLogoSrc } from "@/lib/brand"
import { useAuthStore } from "@/stores/authStore"
import type { AuthUser } from "@/lib/types"

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const login = useLogin()
  const [email, setEmail] = useState("m.furqan@dolftech.com")
  const [password, setPassword] = useState("DolfTech123!")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tokenRes = await login.mutateAsync({ email, password })
      const me = (
        await api.get<AuthUser>("/auth/me", {
          headers: { Authorization: `Bearer ${tokenRes.access_token}` },
        })
      ).data
      setAuth(tokenRes.access_token, me)
      toast.success(t("common.welcome"))
      navigate("/")
    } catch {
      toast.error("Invalid credentials")
    }
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-[#f8fafc] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.1),transparent_35%)]" />
      <Card className="relative w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary/10 p-3">
            <img src={brandLogoSrc} alt="Dolf" className="size-full object-contain" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-heading text-2xl">{t("common.appName")}</CardTitle>
            <CardDescription className="text-base">{t("common.loginSubtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    className="h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t("common.password")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    className="h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FieldContent>
              </Field>
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={login.isPending}>
                {login.isPending ? t("common.loading") : t("common.login")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
