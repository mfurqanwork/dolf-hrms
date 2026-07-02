export type UserRole = "super_admin" | "company_admin" | "employee"

export type RequestType = "document" | "shift" | "work_type"
export type RequestStatus = "pending" | "approved" | "rejected"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  company_id: string | null
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface DashboardStats {
  employee_count: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
}

export interface EmployeeContract {
  id: string
  contract_type: string
  start_date: string | null
  end_date: string | null
  salary: number | null
  currency: string
}

export interface Employee {
  id: string
  company_id: string
  user_id: string | null
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department: string | null
  job_title: string | null
  hire_date: string | null
  status: string
  avatar_initials: string | null
  nationality: string | null
  date_of_birth: string | null
  address: string | null
  manager_name: string | null
  work_type: string | null
  shift: string | null
  contract: EmployeeContract | null
}

export interface HrRequest {
  id: string
  company_id: string
  employee_id: string
  employee_name: string | null
  request_type: RequestType
  title: string
  description: string | null
  status: RequestStatus
  created_at: string
  reviewed_at: string | null
}

export interface RequestCreatePayload {
  request_type: RequestType
  title: string
  description?: string
}

export interface EmployeeUpdatePayload {
  phone?: string
  department?: string
  job_title?: string
  nationality?: string
  address?: string
  manager_name?: string
  work_type?: string
  shift?: string
}
