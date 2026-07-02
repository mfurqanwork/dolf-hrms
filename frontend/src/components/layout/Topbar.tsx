import { Globe, LogOut, Menu, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthStore } from "@/stores/authStore"

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("hrms-theme", dark ? "dark" : "light")
  }, [dark])

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DT"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Menu</TooltipContent>
        </Tooltip>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.welcome")}</p>
          <p className="font-semibold">{user?.full_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="size-4" />
              {i18n.language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void i18n.changeLanguage("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void i18n.changeLanguage("ar")}>العربية</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{dark ? t("common.light") : t("common.dark")}</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar className="size-8 bg-accent text-accent-foreground">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="size-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
