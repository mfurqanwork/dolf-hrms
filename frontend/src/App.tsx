import { Navigate, Route, Routes } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { EmployeeProfilePage } from "@/features/employees/EmployeeProfilePage"
import { EmployeesPage } from "@/features/employees/EmployeesPage"
import { RequestsPage } from "@/features/requests/RequestsPage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { PlaceholderPage } from "@/features/shared/PlaceholderPage"
import { AttendancePage } from "@/features/attendance/AttendancePage"
import { AdminRoute } from "@/components/layout/AdminRoute"

function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeProfilePage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route
            path="attendance"
            element={
              <AdminRoute>
                <AttendancePage />
              </AdminRoute>
            }
          />
          <Route path="recruitment" element={<PlaceholderPage titleKey="recruitment" />} />
          <Route path="onboarding" element={<PlaceholderPage titleKey="onboarding" />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default App
