/** Shape of the backend `AuthResponse` (POST /api/auth/login). */
export interface AuthResponse {
  token: string;
  employeeId: number;
  email: string;
  firstName: string;
  lastName: string;
}

/** Shape of the backend `EmployeeResponse` (GET /api/auth/me). */
export interface EmployeeResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}