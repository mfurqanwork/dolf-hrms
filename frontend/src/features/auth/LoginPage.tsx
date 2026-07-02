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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <img src={brandLogoSrc} alt="Dolf" className="size-12 object-contain" />
          </div>
          <CardTitle>{t("common.appName")}</CardTitle>
          <CardDescription>{t("common.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FieldContent>
              </Field>
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? t("common.loading") : t("common.login")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
