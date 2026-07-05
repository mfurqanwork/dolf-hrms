import { lazy, type ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
} from "lucide-react"
import { PlaceholderPage } from "@/features/shared/PlaceholderPage"

const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
)
const EmployeesPage = lazy(() =>
  import("@/features/employees/EmployeesPage").then((m) => ({
    default: m.EmployeesPage,
  })),
)
const EmployeeProfilePage = lazy(() =>
  import("@/features/employees/EmployeeProfilePage").then((m) => ({
    default: m.EmployeeProfilePage,
  })),
)
const RequestsPage = lazy(() =>
  import("@/features/requests/RequestsPage").then((m) => ({
    default: m.RequestsPage,
  })),
)
const AttendancePage = lazy(() =>
  import("@/features/attendance/AttendancePage").then((m) => ({
    default: m.AttendancePage,
  })),
)
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
)

function createPlaceholderPage(titleKey: string): ComponentType {
  return function PlaceholderRoutePage() {
    return <PlaceholderPage titleKey={titleKey} />
  }
}

export interface RouteConfig {
  path: string
  name: string
  component: ComponentType
  icon?: LucideIcon
  protected: boolean
  showInNav?: boolean
  adminOnly?: boolean
  /** i18n key under common.* */
  labelKey?: string
  index?: boolean
}

export const paths = {
  login: "/login",
  home: "/",
  employees: "/employees",
  employee: (id: string) => `/employees/${id}`,
  requests: "/requests",
  attendance: "/attendance",
  recruitment: "/recruitment",
  onboarding: "/onboarding",
  settings: "/settings",
} as const

export const routes: RouteConfig[] = [
  {
    path: paths.login,
    name: "login",
    component: LoginPage,
    protected: false,
    showInNav: false,
  },
  {
    path: paths.home,
    name: "dashboard",
    component: DashboardPage,
    icon: LayoutDashboard,
    protected: true,
    showInNav: true,
    labelKey: "dashboard",
    index: true,
  },
  {
    path: paths.employees,
    name: "employees",
    component: EmployeesPage,
    icon: Users,
    protected: true,
    showInNav: true,
    labelKey: "employees",
  },
  {
    path: "/employees/:id",
    name: "employeeDetail",
    component: EmployeeProfilePage,
    protected: true,
    showInNav: false,
  },
  {
    path: paths.requests,
    name: "requests",
    component: RequestsPage,
    icon: ClipboardList,
    protected: true,
    showInNav: true,
    labelKey: "requests",
  },
  {
    path: paths.attendance,
    name: "attendance",
    component: AttendancePage,
    icon: CalendarClock,
    protected: true,
    showInNav: true,
    adminOnly: true,
    labelKey: "attendance",
  },
  {
    path: paths.recruitment,
    name: "recruitment",
    component: createPlaceholderPage("recruitment"),
    icon: Briefcase,
    protected: true,
    showInNav: true,
    adminOnly: true,
    labelKey: "recruitment",
  },
  {
    path: paths.onboarding,
    name: "onboarding",
    component: createPlaceholderPage("onboarding"),
    icon: UserPlus,
    protected: true,
    showInNav: true,
    adminOnly: true,
    labelKey: "onboarding",
  },
  {
    path: paths.settings,
    name: "settings",
    component: SettingsPage,
    icon: Settings,
    protected: true,
    showInNav: true,
    labelKey: "settings",
  },
]

export const getProtectedRoutes = () => routes.filter((route) => route.protected)

export const getPublicRoutes = () => routes.filter((route) => !route.protected)

export const getNavigationRoutes = () => routes.filter((route) => route.showInNav)

export function toNestedRoutePath(path: string): string | undefined {
  if (path === paths.home) return undefined
  return path.replace(/^\//, "")
}
