import { Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AdminRoute } from "@/components/layout/AdminRoute"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getProtectedRoutes,
  getPublicRoutes,
  paths,
  toNestedRoutePath,
  type RouteConfig,
} from "@/routes/routes"

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Skeleton className="h-8 w-48" />
    </div>
  )
}

function renderRouteElement(route: RouteConfig) {
  const Component = route.component
  const page = (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  )

  if (route.adminOnly) {
    return <AdminRoute>{page}</AdminRoute>
  }

  return page
}

export function AppRouter() {
  const token = useAuthStore((s) => s.token)
  const publicRoutes = getPublicRoutes()
  const protectedRoutes = getProtectedRoutes()

  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.name}
          path={route.path}
          element={
            token ? <Navigate to={paths.home} replace /> : renderRouteElement(route)
          }
        />
      ))}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {protectedRoutes.map((route) => {
            const element = renderRouteElement(route)
            if (route.index) {
              return <Route key={route.name} index element={element} />
            }
            return (
              <Route
                key={route.name}
                path={toNestedRoutePath(route.path)}
                element={element}
              />
            )
          })}
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={token ? paths.home : paths.login} replace />}
      />
    </Routes>
  )
}
