import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { brandLogoSrc } from "@/lib/brand";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { to: "/", icon: LayoutDashboard, labelKey: "dashboard" },
  { to: "/employees", icon: Users, labelKey: "employees" },
  { to: "/requests", icon: ClipboardList, labelKey: "requests" },
  { to: "/attendance", icon: CalendarClock, labelKey: "attendance", adminOnly: true },
  { to: "/recruitment", icon: Briefcase, labelKey: "recruitment" },
  { to: "/onboarding", icon: UserPlus, labelKey: "onboarding" },
  { to: "/settings", icon: Settings, labelKey: "settings" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.role !== "employee",
  );

  return (
    <aside className="flex h-full w-[17rem] flex-col bg-sidebar text-sidebar-foreground shadow-lg">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex size-11 items-center justify-center rounded-xl bg-white p-1.5">
          <img
            src={brandLogoSrc}
            alt="Dolf Technologies"
            className="size-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0 text-start">
          <p className="truncate font-heading text-sm font-semibold leading-tight">
            Dolf Technologies
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {t("common.appName")}
          </p>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <ScrollArea className="flex-1">
        <nav className="space-y-1.5 p-4">
          {visibleItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-sidebar-primary/40"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              {t(`common.${labelKey}`)}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
