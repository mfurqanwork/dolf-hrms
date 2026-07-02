export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** Parse YYYY-MM-DD as local calendar date (avoids UTC timezone shifts). */
export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateLabel(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatLocalDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return formatLocalDate(d)
}

export function todayIso(): string {
  return formatLocalDate(new Date())
}

/** Saudi Arabia: Friday (5) and Saturday (6) in JS getDay(). */
export function isWorkingDay(iso: string): boolean {
  const day = parseLocalDate(iso).getDay()
  return day !== 5 && day !== 6
}

export function isTodayWorkingDay(): boolean {
  return isWorkingDay(todayIso())
}

export function formatDateWithWeekday(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}
