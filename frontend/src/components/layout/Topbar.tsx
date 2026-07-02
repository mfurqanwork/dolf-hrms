import { Globe, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { AttendanceActions } from "@/components/layout/AttendanceActions";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("hrms-theme", dark ? "dark" : "light");
  }, [dark]);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DT";

  return (
    <header className="sticky top-0 z-30 flex h-[6rem] shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-6 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="lg"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Menu</TooltipContent>
        </Tooltip>
        <p className="truncate font-heading text-lg font-semibold text-foreground md:text-xl">
          {user?.full_name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <AttendanceActions />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[5.5rem] gap-2"
            >
              <Globe className="size-4" />
              {i18n.language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={() => void i18n.changeLanguage("en")}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void i18n.changeLanguage("ar")}>
              العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDark((v) => !v)}
            >
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {dark ? t("common.light") : t("common.dark")}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="hidden h-8 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="lg" className="gap-3 px-3">
              <Avatar className="size-9 bg-[#f97316] text-white">
                <AvatarFallback className="bg-[#f97316] text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem disabled className="text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="size-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
