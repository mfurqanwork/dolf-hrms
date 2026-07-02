import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  AuthUser,
  DashboardStats,
  Employee,
  EmployeeUpdatePayload,
  HrRequest,
  RequestCreatePayload,
  TokenResponse,
} from "@/lib/types"

export const queryKeys = {
  me: ["me"] as const,
  dashboard: ["dashboard"] as const,
  employees: ["employees"] as const,
  employee: (id: string) => ["employees", id] as const,
  requests: ["requests"] as const,
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await api.get<AuthUser>("/auth/me")).data,
    enabled,
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => (await api.get<DashboardStats>("/dashboard/stats")).data,
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: async () => (await api.get<Employee[]>("/employees")).data,
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: async () => (await api.get<Employee>(`/employees/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EmployeeUpdatePayload) =>
      (await api.patch<Employee>(`/employees/${id}`, payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees })
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(id) })
    },
  })
}

export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests,
    queryFn: async () => (await api.get<HrRequest[]>("/requests")).data,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RequestCreatePayload) =>
      (await api.post<HrRequest>("/requests", payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.patch<HrRequest>(`/requests/${id}/approve`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.patch<HrRequest>(`/requests/${id}/reject`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      (await api.post<TokenResponse>("/auth/login/json", payload)).data,
  })
}
