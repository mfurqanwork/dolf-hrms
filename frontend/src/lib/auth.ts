import type { TFunction } from "i18next"
import type { UserRole } from "@/lib/types"

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === "super_admin" || role === "company_admin"
}

export function getRoleLabel(t: TFunction, role: UserRole | undefined): string {
  switch (role) {
    case "super_admin":
      return t("common.roleSuperAdmin")
    case "company_admin":
      return t("common.roleCompanyAdmin")
    case "employee":
      return t("common.roleEmployee")
    default:
      return ""
  }
}
