import { CalendarOff, LogIn, LogOut } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCheckIn, useCheckOut, useTodayAttendance } from "@/hooks/useHrmsApi"
import { useAuthStore } from "@/stores/authStore"
import { formatTime } from "@/lib/datetime"

export function AttendanceActions() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const enabled = Boolean(user) && user?.role !== "super_admin"

  const { data, isError } = useTodayAttendance(enabled)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()

  if (!enabled || isError || !data) return null

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync()
      toast.success(t("common.checkedIn"))
    } catch {
      toast.error(t("common.checkInFailed"))
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOut.mutateAsync()
      toast.success(t("common.checkedOut"))
    } catch {
      toast.error(t("common.checkOutFailed"))
    }
  }

  if (!data.is_working_day) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="h-11 gap-2 px-4 text-sm">
            <CalendarOff className="size-4" />
            <span className="hidden sm:inline">{t("common.weekendOff")}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{t("common.weekendNoCheckIn")}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {data.record?.check_in && (
        <span className="hidden text-xs text-muted-foreground lg:inline">
          {t("common.checkIn")}: {formatTime(data.record.check_in)}
        </span>
      )}
      <Tooltip>
        <TooltipTrigger>
          <Button
            size="lg"
            variant="outline"
            disabled={!data.can_check_in || checkIn.isPending}
            onClick={() => void handleCheckIn()}
          >
            <LogIn />
            <span className="hidden sm:inline">{t("common.checkIn")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("common.checkInTooltip")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button
            size="lg"
            disabled={!data.can_check_out || checkOut.isPending}
            onClick={() => void handleCheckOut()}
          >
            <LogOut />
            <span className="hidden sm:inline">{t("common.checkOut")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("common.checkOutTooltip")}</TooltipContent>
      </Tooltip>
    </div>
  )
}
