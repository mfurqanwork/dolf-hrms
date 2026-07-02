import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { brandLogoSrc } from "@/lib/brand"

const navItems = [
  { to: "/", icon: LayoutDashboard, labelKey: "dashboard" },
  { to: "/employees", icon: Users, labelKey: "employees" },
  { to: "/requests", icon: ClipboardList, labelKey: "requests" },
  { to: "/recruitment", icon: Briefcase, labelKey: "recruitment" },
  { to: "/onboarding", icon: UserPlus, labelKey: "onboarding" },
  { to: "/settings", icon: Settings, labelKey: "settings" },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <img
          src={brandLogoSrc}
          alt="Dolf Technologies"
          className="h-9 w-9 rounded-lg bg-white/10 object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <div className="text-start">
          <p className="text-sm font-semibold leading-tight">Dolf Technologies</p>
          <p className="text-xs text-sidebar-foreground/70">{t("common.appName")}</p>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-3">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {t(`common.${labelKey}`)}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
